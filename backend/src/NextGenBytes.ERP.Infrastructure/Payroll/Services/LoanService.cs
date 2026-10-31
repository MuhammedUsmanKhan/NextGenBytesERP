using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Interfaces;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Domain.Payroll.Enums;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Payroll.Services;

public sealed class LoanService : ILoanService
{
    private readonly AppDbContext _context;

    public LoanService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResponse<LoanAndAdvanceResponse>>> GetAllAsync(
        Guid? employeeId = null,
        LoanType? type = null,
        LoanStatus? status = null,
        int page = 1,
        int pageSize = 20)
    {
        IQueryable<LoanAndAdvance> query = _context.LoansAndAdvances
            .AsNoTracking()
            .Include(x => x.Employee)
                .ThenInclude(e => e.Department);

        if (employeeId.HasValue)
            query = query.Where(x => x.EmployeeId == employeeId.Value);

        if (type.HasValue)
            query = query.Where(x => x.Type == type.Value);

        if (status.HasValue)
            query = query.Where(x => x.Status == status.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.DisbursedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.ToResponse())
            .ToListAsync();

        return ApiResponse<PagedResponse<LoanAndAdvanceResponse>>.Ok(
            new PagedResponse<LoanAndAdvanceResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<LoanAndAdvanceResponse>> GetByIdAsync(Guid id)
    {
        var loan = await _context.LoansAndAdvances
            .AsNoTracking()
            .Include(x => x.Employee)
                .ThenInclude(e => e.Department)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (loan is null)
            return ApiResponse<LoanAndAdvanceResponse>.Fail($"Loan/Advance with ID '{id}' was not found.");

        return ApiResponse<LoanAndAdvanceResponse>.Ok(loan.ToResponse());
    }

    public async Task<ApiResponse<LoanAndAdvanceResponse>> CreateAsync(CreateLoanRequest request, string userId)
    {
        if (request.TotalAmount <= 0)
            return ApiResponse<LoanAndAdvanceResponse>.Fail("Total amount must be greater than zero.");

        var employee = await _context.Employees
            .Include(x => x.Department)
            .FirstOrDefaultAsync(x => x.Id == request.EmployeeId);

        if (employee is null)
            return ApiResponse<LoanAndAdvanceResponse>.Fail($"Employee with ID '{request.EmployeeId}' was not found.");

        var monthlyDeduction = request.MonthlyDeduction > 0
            ? request.MonthlyDeduction
            : request.TotalAmount; // Defaults to full deduction for short-term salary advances

        var now = DateTime.UtcNow;
        var loan = new LoanAndAdvance
        {
            Id = Guid.NewGuid(),
            EmployeeId = request.EmployeeId,
            Type = request.Type,
            TotalAmount = request.TotalAmount,
            MonthlyDeduction = monthlyDeduction,
            RemainingBalance = request.TotalAmount,
            DisbursedDate = request.DisbursedDate ?? now,
            Status = LoanStatus.Active,
            Notes = request.Notes?.Trim(),
            CreatedAt = now,
            CreatedBy = userId
        };

        _context.LoansAndAdvances.Add(loan);
        await _context.SaveChangesAsync();

        loan.Employee = employee;
        return ApiResponse<LoanAndAdvanceResponse>.Ok(loan.ToResponse(), "Disbursed successfully.");
    }

    public async Task<ApiResponse<LoanAndAdvanceResponse>> UpdateAsync(Guid id, UpdateLoanRequest request, string userId)
    {
        var loan = await _context.LoansAndAdvances
            .Include(x => x.Employee)
                .ThenInclude(e => e.Department)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (loan is null)
            return ApiResponse<LoanAndAdvanceResponse>.Fail($"Loan/Advance with ID '{id}' was not found.");

        if (request.MonthlyDeduction > 0)
            loan.MonthlyDeduction = request.MonthlyDeduction;

        if (request.RemainingBalance.HasValue)
        {
            loan.RemainingBalance = Math.Max(0m, request.RemainingBalance.Value);
            if (loan.RemainingBalance == 0m)
                loan.Status = LoanStatus.Closed;
            else
                loan.Status = request.Status;
        }
        else
        {
            loan.Status = request.Status;
        }

        loan.Notes = request.Notes?.Trim();
        loan.UpdatedAt = DateTime.UtcNow;
        loan.UpdatedBy = userId;

        await _context.SaveChangesAsync();
        return ApiResponse<LoanAndAdvanceResponse>.Ok(loan.ToResponse(), "Updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string userId)
    {
        var loan = await _context.LoansAndAdvances.FirstOrDefaultAsync(x => x.Id == id);
        if (loan is null)
            return ApiResponse<bool>.Fail($"Loan/Advance with ID '{id}' was not found.");

        _context.LoansAndAdvances.Remove(loan);
        await _context.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true, "Deleted successfully.");
    }

    public async Task<ApiResponse<List<LoanAndAdvanceResponse>>> GetActiveLoansForEmployeeAsync(Guid employeeId)
    {
        var loans = await _context.LoansAndAdvances
            .AsNoTracking()
            .Include(x => x.Employee)
                .ThenInclude(e => e.Department)
            .Where(x => x.EmployeeId == employeeId && x.Status == LoanStatus.Active && x.RemainingBalance > 0)
            .OrderBy(x => x.DisbursedDate)
            .Select(x => x.ToResponse())
            .ToListAsync();

        return ApiResponse<List<LoanAndAdvanceResponse>>.Ok(loans);
    }
}

