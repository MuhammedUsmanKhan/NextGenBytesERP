using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Interfaces;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Domain.Payroll.Enums;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Payroll.Services;

public sealed class PayrollRunService : IPayrollRunService
{
    private readonly AppDbContext _context;
    private readonly IPayrollCalculationEngine _calculationEngine;

    public PayrollRunService(AppDbContext context, IPayrollCalculationEngine calculationEngine)
    {
        _context = context;
        _calculationEngine = calculationEngine;
    }

    public async Task<ApiResponse<PagedResponse<PayrollRunResponse>>> GetRunsAsync(
        string? monthYear = null,
        int page = 1,
        int pageSize = 20)
    {
        IQueryable<PayrollRun> query = _context.PayrollRuns
            .AsNoTracking()
            .Include(x => x.Payslips);

        if (!string.IsNullOrWhiteSpace(monthYear))
            query = query.Where(x => x.MonthYear == monthYear);

        var totalCount = await query.CountAsync();

        var runs = await query
            .OrderByDescending(x => x.MonthYear)
            .ThenByDescending(x => x.RunDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = runs.Select(x => x.ToResponse()).ToList();

        return ApiResponse<PagedResponse<PayrollRunResponse>>.Ok(
            new PagedResponse<PayrollRunResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<PayrollRunDetailResponse>> GetRunByIdAsync(Guid id)
    {
        var run = await _context.PayrollRuns
            .AsNoTracking()
            .Include(x => x.Payslips)
                .ThenInclude(p => p.Employee)
            .Include(x => x.Payslips)
                .ThenInclude(p => p.Denomination)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (run is null)
            return ApiResponse<PayrollRunDetailResponse>.Fail($"Payroll run with ID '{id}' was not found.");

        return ApiResponse<PayrollRunDetailResponse>.Ok(BuildDetailResponse(run));
    }

    public async Task<ApiResponse<PayrollRunDetailResponse>> CreateOrRecalculateRunAsync(
        CreatePayrollRunRequest request,
        string userId)
    {
        if (string.IsNullOrWhiteSpace(request.MonthYear))
            return ApiResponse<PayrollRunDetailResponse>.Fail("MonthYear is required (format: YYYY-MM).");

        var normalizedCategory = string.IsNullOrWhiteSpace(request.DepartmentCategory)
            ? null
            : request.DepartmentCategory.Trim();

        // 1. Check existing run
        var existingRun = await _context.PayrollRuns
            .Include(x => x.Payslips)
                .ThenInclude(p => p.Denomination)
            .FirstOrDefaultAsync(x => x.MonthYear == request.MonthYear && x.DepartmentCategory == normalizedCategory);

        if (existingRun != null && existingRun.Status == PayrollRunStatus.Approved)
        {
            return ApiResponse<PayrollRunDetailResponse>.Fail(
                $"Payroll run for '{request.MonthYear}' ({normalizedCategory ?? "All"}) is already approved and locked.");
        }

        // 2. Fetch active employees with active contracts
        IQueryable<Employee> empQuery = _context.Employees
            .Include(x => x.Department)
            .Include(x => x.Contracts.Where(c => c.IsActive))
            .Where(x => x.Status == "Active");

        if (!string.IsNullOrWhiteSpace(normalizedCategory))
        {
            empQuery = empQuery.Where(x => x.Category == normalizedCategory);
        }

        var employees = await empQuery.OrderBy(x => x.Code).ToListAsync();
        if (employees.Count == 0)
        {
            return ApiResponse<PayrollRunDetailResponse>.Fail("No active employees found matching the requested category.");
        }

        var empIds = employees.Select(x => x.Id).ToList();

        // 3. Fetch attendance records for this month
        var attendanceMap = await _context.AttendanceSummaries
            .AsNoTracking()
            .Where(x => x.MonthYear == request.MonthYear && empIds.Contains(x.EmployeeId))
            .ToDictionaryAsync(x => x.EmployeeId);

        // 4. Fetch active loans and advances
        var activeLoans = await _context.LoansAndAdvances
            .Where(x => empIds.Contains(x.EmployeeId) && x.Status == LoanStatus.Active && x.RemainingBalance > 0)
            .ToListAsync();

        // 5. Initialize or clear existing run
        var now = DateTime.UtcNow;
        PayrollRun run;

        if (existingRun != null)
        {
            run = existingRun;
            run.Payslips.Clear();
            run.RunDate = now;
            run.Notes = request.Notes?.Trim() ?? run.Notes;
            run.UpdatedAt = now;
            run.UpdatedBy = userId;
        }
        else
        {
            run = new PayrollRun
            {
                Id = Guid.NewGuid(),
                MonthYear = request.MonthYear,
                DepartmentCategory = normalizedCategory,
                RunDate = now,
                Status = PayrollRunStatus.Draft,
                Notes = request.Notes?.Trim(),
                CreatedAt = now,
                CreatedBy = userId
            };
            _context.PayrollRuns.Add(run);
        }

        // 6. Calculate payslips for each employee
        foreach (var emp in employees)
        {
            var contract = emp.Contracts.FirstOrDefault(c => c.IsActive);
            if (contract == null)
                continue; // Skip employee without an active contract

            attendanceMap.TryGetValue(emp.Id, out var attendance);

            var payslip = _calculationEngine.CalculatePayslip(emp, contract, attendance, activeLoans);
            payslip.PayrollRunId = run.Id;
            payslip.PayrollRun = run;

            run.Payslips.Add(payslip);
        }

        // 7. Aggregate totals
        run.TotalGrossSalary = run.Payslips.Sum(p => p.GrossSalary);
        run.TotalDeductions = run.Payslips.Sum(p => p.TotalDeductions);
        run.TotalDueGross = run.Payslips.Sum(p => p.DueGrossSalary);
        run.TotalDueGrossRounded = run.Payslips.Sum(p => p.DueGrossSalaryRounded);
        run.TotalLoansAndAdvances = run.Payslips.Sum(p => p.TotalLess);
        run.TotalNetSalary = run.Payslips.Sum(p => p.NetSalary);

        await _context.SaveChangesAsync();

        return ApiResponse<PayrollRunDetailResponse>.Ok(
            BuildDetailResponse(run),
            "Payroll calculated successfully.");
    }

    public async Task<ApiResponse<PayrollRunResponse>> ApproveRunAsync(Guid id, string userId, bool allowOverride = false)
    {
        var run = await _context.PayrollRuns
            .Include(x => x.Payslips)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (run is null)
            return ApiResponse<PayrollRunResponse>.Fail($"Payroll run with ID '{id}' was not found.");

        if (run.Status == PayrollRunStatus.Approved)
            return ApiResponse<PayrollRunResponse>.Ok(run.ToResponse(), "Payroll run is already approved.");

        // Biometric Attendance Safety Gate: Check for unresolved attendance exceptions in this payroll period
        if (DateTime.TryParseExact(run.MonthYear, "yyyy-MM", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var monthDate))
        {
            var startDate = new DateOnly(monthDate.Year, monthDate.Month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            var unresolvedExceptions = await _context.DailyAttendances
                .CountAsync(d => d.Date >= startDate && d.Date <= endDate && d.HasException && !d.IsResolved);

            if (unresolvedExceptions > 0 && !allowOverride)
            {
                return ApiResponse<PayrollRunResponse>.Fail(
                    $"Cannot approve payroll run. There are {unresolvedExceptions} unresolved attendance exception(s) for period '{run.MonthYear}'. " +
                    "Please resolve all missing check-ins/check-outs in the Attendance Review Queue before finalizing payroll, or request an authorized supervisor override.");
            }

            if (unresolvedExceptions > 0 && allowOverride)
            {
                var overrideNote = $"[Supervisor Override: Approved with {unresolvedExceptions} unresolved attendance exception(s) by {userId}]";
                run.Notes = string.IsNullOrWhiteSpace(run.Notes) ? overrideNote : $"{run.Notes}\n{overrideNote}";
            }
        }

        var now = DateTime.UtcNow;
        run.Status = PayrollRunStatus.Approved;
        run.ApprovedBy = userId;
        run.ApprovedAt = now;
        run.UpdatedAt = now;
        run.UpdatedBy = userId;

        // Apply loan & advance balance reductions
        var empIds = run.Payslips.Where(p => p.TotalLess > 0).Select(p => p.EmployeeId).Distinct().ToList();
        var loans = await _context.LoansAndAdvances
            .Where(x => empIds.Contains(x.EmployeeId) && x.Status == LoanStatus.Active && x.RemainingBalance > 0)
            .ToListAsync();

        foreach (var payslip in run.Payslips.Where(p => p.TotalLess > 0))
        {
            var empLoans = loans.Where(l => l.EmployeeId == payslip.EmployeeId).ToList();

            // 1. Deduct advances
            var remainingAdvToDeduct = payslip.AdvanceSalaryDeduction;
            foreach (var adv in empLoans.Where(l => l.Type == LoanType.SalaryAdvance))
            {
                if (remainingAdvToDeduct <= 0) break;
                var deduct = Math.Min(adv.RemainingBalance, remainingAdvToDeduct);
                adv.RemainingBalance -= deduct;
                remainingAdvToDeduct -= deduct;
                if (adv.RemainingBalance <= 0) adv.Status = LoanStatus.Closed;
                adv.UpdatedAt = now;
                adv.UpdatedBy = userId;
            }

            // 2. Deduct term loans
            var remainingLoanToDeduct = payslip.LoanDeduction;
            foreach (var loan in empLoans.Where(l => l.Type == LoanType.Loan))
            {
                if (remainingLoanToDeduct <= 0) break;
                var deduct = Math.Min(loan.RemainingBalance, remainingLoanToDeduct);
                loan.RemainingBalance -= deduct;
                remainingLoanToDeduct -= deduct;
                if (loan.RemainingBalance <= 0) loan.Status = LoanStatus.Closed;
                loan.UpdatedAt = now;
                loan.UpdatedBy = userId;
            }
        }

        await _context.SaveChangesAsync();
        return ApiResponse<PayrollRunResponse>.Ok(run.ToResponse(), "Payroll run approved and loan balances updated.");
    }

    public async Task<ApiResponse<bool>> DeleteRunAsync(Guid id, string userId)
    {
        var run = await _context.PayrollRuns
            .Include(x => x.Payslips)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (run is null)
            return ApiResponse<bool>.Fail($"Payroll run with ID '{id}' was not found.");

        if (run.Status == PayrollRunStatus.Approved)
            return ApiResponse<bool>.Fail("Cannot delete an approved and locked payroll run.");

        _context.PayrollRuns.Remove(run);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Draft payroll run deleted successfully.");
    }

    private static PayrollRunDetailResponse BuildDetailResponse(PayrollRun run)
    {
        var payslips = run.Payslips.Select(p => p.ToResponse()).OrderBy(p => p.EmployeeCode).ToList();

        // Calculate aggregated cash note breakdown for the whole run
        var n5000 = 0;
        var n1000 = 0;
        var n500 = 0;
        var n100 = 0;
        var n50 = 0;
        var n20 = 0;
        var n10 = 0;
        var coins = 0;

        foreach (var p in run.Payslips.Where(x => x.Denomination != null))
        {
            var d = p.Denomination!;
            n5000 += d.Note5000;
            n1000 += d.Note1000;
            n500 += d.Note500;
            n100 += d.Note100;
            n50 += d.Note50;
            n20 += d.Note20;
            n10 += d.Note10;
            coins += d.CoinsRemainder;
        }

        var totalDenom = new PayslipDenominationResponse
        {
            Note5000 = n5000,
            Note1000 = n1000,
            Note500 = n500,
            Note100 = n100,
            Note50 = n50,
            Note20 = n20,
            Note10 = n10,
            CoinsRemainder = coins
        };

        return new PayrollRunDetailResponse
        {
            Run = run.ToResponse(),
            Payslips = payslips,
            TotalDenominations = totalDenom
        };
    }
}

