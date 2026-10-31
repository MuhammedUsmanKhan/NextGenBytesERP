using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Interfaces;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Payroll.Services;

public sealed class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _context;

    public EmployeeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResponse<EmployeeResponse>>> GetAllAsync(
        int page,
        int pageSize,
        string? search = null,
        string? category = null,
        Guid? departmentId = null,
        string? status = null)
    {
        IQueryable<Employee> query = _context.Employees
            .AsNoTracking()
            .Include(x => x.Department)
            .Include(x => x.ShiftDefinition)
            .Include(x => x.Contracts.Where(c => c.IsActive));

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(x =>
                x.FullName.Contains(s) ||
                x.Code.Contains(s) ||
                (x.CNIC != null && x.CNIC.Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(x => x.Category == category);
        }

        if (departmentId.HasValue)
        {
            query = query.Where(x => x.DepartmentId == departmentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }

        var totalCount = await query.CountAsync();

        var employees = await query
            .OrderBy(x => x.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = employees.Select(x => x.ToResponse()).ToList();

        return ApiResponse<PagedResponse<EmployeeResponse>>.Ok(
            new PagedResponse<EmployeeResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<EmployeeResponse>> GetByIdAsync(Guid id)
    {
        var employee = await _context.Employees
            .AsNoTracking()
            .Include(x => x.Department)
            .Include(x => x.ShiftDefinition)
            .Include(x => x.Contracts)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (employee is null)
            return ApiResponse<EmployeeResponse>.Fail($"Employee with ID '{id}' was not found.");

        return ApiResponse<EmployeeResponse>.Ok(employee.ToResponse());
    }

    public async Task<ApiResponse<EmployeeResponse>> CreateAsync(CreateEmployeeRequest request, string createdBy)
    {
        string code = request.Code?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(code))
        {
            var count = await _context.Employees.CountAsync() + 1;
            code = $"EMP-{count:D4}";
        }

        var exists = await _context.Employees.AnyAsync(x => x.Code == code);
        if (exists)
            return ApiResponse<EmployeeResponse>.Fail($"An employee with code '{code}' already exists.");

        var bioId = string.IsNullOrWhiteSpace(request.BiometricDeviceId) ? null : request.BiometricDeviceId.Trim();
        if (bioId != null)
        {
            var bioExists = await _context.Employees.AnyAsync(x => x.BiometricDeviceId == bioId);
            if (bioExists)
                return ApiResponse<EmployeeResponse>.Fail($"Biometric Device ID '{bioId}' is already assigned to another employee.");
        }

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            Code = code,
            FullName = request.FullName.Trim(),
            BiometricDeviceId = bioId,
            ShiftDefinitionId = request.ShiftDefinitionId,
            CNIC = request.CNIC?.Trim(),
            Phone = request.Phone?.Trim(),
            DepartmentId = request.DepartmentId,
            Designation = request.Designation?.Trim(),
            Category = string.IsNullOrWhiteSpace(request.Category) ? "Salaries Labor" : request.Category.Trim(),
            DateOfJoining = request.DateOfJoining,
            Status = string.IsNullOrWhiteSpace(request.Status) ? "Active" : request.Status.Trim(),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };

        if (request.CreateContract && request.BasicRate > 0)
        {
            var contract = new EmployeeContract
            {
                Id = Guid.NewGuid(),
                EmployeeId = employee.Id,
                PayType = request.PayType,
                DisbursementType = request.DisbursementType,
                BasicRate = request.BasicRate,
                AttendanceAllowance = request.AttendanceAllowance,
                OtherAllowances = request.OtherAllowances,
                MonthlyDivisorDays = request.MonthlyDivisorDays > 0 ? request.MonthlyDivisorDays : 30,
                DailyShiftHours = request.DailyShiftHours > 0 ? request.DailyShiftHours : (employee.Category == "Office Staff" ? 9m : 10m),
                NightShiftMinutes = request.NightShiftMinutes > 0 ? request.NightShiftMinutes : 840,
                AbsencePolicy = request.AbsencePolicy,
                GraceAbsentDays = request.GraceAbsentDays,
                OvertimeEligible = request.OvertimeEligible,
                OvertimeMultiplier = request.OvertimeMultiplier > 0 ? request.OvertimeMultiplier : 1.5m,
                RoundingMode = request.RoundingMode,
                BankName = request.BankName?.Trim(),
                BankAccountNumber = request.BankAccountNumber?.Trim(),
                EffectiveFrom = request.EffectiveFrom ?? DateTime.UtcNow,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy
            };

            employee.Contracts.Add(contract);
        }

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        // Reload navigations if assigned
        if (employee.DepartmentId.HasValue)
        {
            await _context.Entry(employee).Reference(e => e.Department).LoadAsync();
        }
        if (employee.ShiftDefinitionId.HasValue)
        {
            await _context.Entry(employee).Reference(e => e.ShiftDefinition).LoadAsync();
        }

        return ApiResponse<EmployeeResponse>.Ok(employee.ToResponse(), "Employee created successfully.");
    }

    public async Task<ApiResponse<EmployeeResponse>> UpdateAsync(Guid id, UpdateEmployeeRequest request, string updatedBy)
    {
        var employee = await _context.Employees
            .Include(x => x.Department)
            .Include(x => x.ShiftDefinition)
            .Include(x => x.Contracts.Where(c => c.IsActive))
            .FirstOrDefaultAsync(x => x.Id == id);

        if (employee is null)
            return ApiResponse<EmployeeResponse>.Fail($"Employee with ID '{id}' was not found.");

        var bioId = string.IsNullOrWhiteSpace(request.BiometricDeviceId) ? null : request.BiometricDeviceId.Trim();
        if (bioId != null)
        {
            var bioExists = await _context.Employees.AnyAsync(x => x.Id != id && x.BiometricDeviceId == bioId);
            if (bioExists)
                return ApiResponse<EmployeeResponse>.Fail($"Biometric Device ID '{bioId}' is already assigned to another employee.");
        }

        employee.FullName = request.FullName.Trim();
        employee.BiometricDeviceId = bioId;
        employee.ShiftDefinitionId = request.ShiftDefinitionId;
        employee.CNIC = request.CNIC?.Trim();
        employee.Phone = request.Phone?.Trim();
        employee.DepartmentId = request.DepartmentId;
        employee.Designation = request.Designation?.Trim();
        employee.Category = string.IsNullOrWhiteSpace(request.Category) ? employee.Category : request.Category.Trim();
        employee.DateOfJoining = request.DateOfJoining;
        employee.Status = string.IsNullOrWhiteSpace(request.Status) ? employee.Status : request.Status.Trim();
        employee.UpdatedAt = DateTime.UtcNow;
        employee.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        if (employee.DepartmentId.HasValue)
        {
            await _context.Entry(employee).Reference(e => e.Department).LoadAsync();
        }
        if (employee.ShiftDefinitionId.HasValue)
        {
            await _context.Entry(employee).Reference(e => e.ShiftDefinition).LoadAsync();
        }

        return ApiResponse<EmployeeResponse>.Ok(employee.ToResponse(), "Employee updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy)
    {
        var employee = await _context.Employees.FirstOrDefaultAsync(x => x.Id == id);
        if (employee is null)
            return ApiResponse<bool>.Fail($"Employee with ID '{id}' was not found.");

        employee.IsDeleted = true;
        employee.DeletedAt = DateTime.UtcNow;
        employee.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true, "Employee deleted successfully.");
    }

    public async Task<ApiResponse<EmployeeContractResponse>> AddContractAsync(
        Guid employeeId, CreateContractRequest request, string createdBy)
    {
        var employee = await _context.Employees
            .Include(x => x.Contracts)
            .FirstOrDefaultAsync(x => x.Id == employeeId);

        if (employee is null)
            return ApiResponse<EmployeeContractResponse>.Fail($"Employee with ID '{employeeId}' was not found.");

        // Deactivate previous active contracts
        var now = DateTime.UtcNow;
        foreach (var c in employee.Contracts.Where(c => c.IsActive))
        {
            c.IsActive = false;
            c.EffectiveTo = now;
            c.UpdatedAt = now;
            c.UpdatedBy = createdBy;
        }

        var newContract = new EmployeeContract
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            PayType = request.PayType,
            DisbursementType = request.DisbursementType,
            BasicRate = request.BasicRate,
            AttendanceAllowance = request.AttendanceAllowance,
            OtherAllowances = request.OtherAllowances,
            MonthlyDivisorDays = request.MonthlyDivisorDays > 0 ? request.MonthlyDivisorDays : 30,
            DailyShiftHours = request.DailyShiftHours > 0 ? request.DailyShiftHours : (employee.Category == "Office Staff" ? 9m : 10m),
            NightShiftMinutes = request.NightShiftMinutes > 0 ? request.NightShiftMinutes : 840,
            AbsencePolicy = request.AbsencePolicy,
            GraceAbsentDays = request.GraceAbsentDays,
            OvertimeEligible = request.OvertimeEligible,
            OvertimeMultiplier = request.OvertimeMultiplier > 0 ? request.OvertimeMultiplier : 1.5m,
            RoundingMode = request.RoundingMode,
            BankName = request.BankName?.Trim(),
            BankAccountNumber = request.BankAccountNumber?.Trim(),
            EffectiveFrom = request.EffectiveFrom ?? now,
            IsActive = true,
            CreatedAt = now,
            CreatedBy = createdBy
        };

        _context.EmployeeContracts.Add(newContract);
        await _context.SaveChangesAsync();

        return ApiResponse<EmployeeContractResponse>.Ok(newContract.ToResponse(), "Contract created and activated successfully.");
    }

    public async Task<ApiResponse<List<EmployeeContractResponse>>> GetContractsAsync(Guid employeeId)
    {
        var contracts = await _context.EmployeeContracts
            .AsNoTracking()
            .Where(x => x.EmployeeId == employeeId)
            .OrderByDescending(x => x.EffectiveFrom)
            .Select(x => x.ToResponse())
            .ToListAsync();

        return ApiResponse<List<EmployeeContractResponse>>.Ok(contracts);
    }
}

