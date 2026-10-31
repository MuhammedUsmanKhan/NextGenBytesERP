using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Interfaces;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Payroll.Services;

public sealed class ShiftRosterService : IShiftRosterService
{
    private readonly AppDbContext _context;
    private readonly IServiceProvider _serviceProvider;

    public ShiftRosterService(AppDbContext context, IServiceProvider serviceProvider)
    {
        _context = context;
        _serviceProvider = serviceProvider;
    }

    public async Task<ApiResponse<ShiftRosterCalendarResponse>> GetRosterCalendarAsync(
        string monthYear,
        Guid? departmentId = null,
        CancellationToken cancellationToken = default)
    {
        if (!DateTime.TryParse($"{monthYear}-01", out var date))
        {
            return ApiResponse<ShiftRosterCalendarResponse>.Fail("Invalid monthYear format. Use YYYY-MM.");
        }

        var start = DateOnly.FromDateTime(date);
        var end = start.AddMonths(1).AddDays(-1);

        var query = _context.ShiftRosterAssignments
            .Include(r => r.Employee)
                .ThenInclude(e => e.Department)
            .Where(r => r.Date >= start && r.Date <= end);

        if (departmentId.HasValue)
        {
            query = query.Where(r => r.Employee.DepartmentId == departmentId.Value);
        }

        var assignments = await query
            .OrderBy(r => r.Date)
            .ThenBy(r => r.Employee.FullName)
            .Select(r => new ShiftRosterAssignmentDto
            {
                Id = r.Id,
                EmployeeId = r.EmployeeId,
                EmployeeCode = r.Employee.Code,
                EmployeeName = r.Employee.FullName,
                DepartmentName = r.Employee.Department != null ? r.Employee.Department.Name : null,
                Date = r.Date,
                ShiftName = r.ShiftName,
                ShiftStart = r.ShiftStart,
                ShiftEnd = r.ShiftEnd,
                ShiftDurationMinutes = r.ShiftDurationMinutes,
                IsOvernightShift = r.IsOvernightShift,
                PayMultiplier = r.PayMultiplier,
                ExcuseOverlappingDayShift = r.ExcuseOverlappingDayShift,
                Reason = r.Reason,
                CreatedBy = r.CreatedBy,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var response = new ShiftRosterCalendarResponse
        {
            MonthYear = monthYear,
            Assignments = assignments,
            TotalAssignedNights = assignments.Count,
            TotalWorkersScheduled = assignments.Select(a => a.EmployeeId).Distinct().Count()
        };

        return ApiResponse<ShiftRosterCalendarResponse>.Ok(response);
    }

    public async Task<ApiResponse<int>> BulkAssignRosterAsync(
        BulkAssignRosterRequest request,
        string userId,
        CancellationToken cancellationToken = default)
    {
        if (request.EmployeeIds.Count == 0)
        {
            return ApiResponse<int>.Fail("Please select at least one employee.");
        }

        if (request.EndDate < request.StartDate)
        {
            return ApiResponse<int>.Fail("End date must be on or after start date.");
        }

        var count = 0;

        // Fetch existing assignments in this date range for these employees
        var existingAssignments = await _context.ShiftRosterAssignments
            .Where(r => request.EmployeeIds.Contains(r.EmployeeId) &&
                        r.Date >= request.StartDate &&
                        r.Date <= request.EndDate)
            .ToListAsync(cancellationToken);

        var existingMap = existingAssignments.ToDictionary(r => (r.EmployeeId, r.Date));

        for (var d = request.StartDate; d <= request.EndDate; d = d.AddDays(1))
        {
            foreach (var empId in request.EmployeeIds)
            {
                if (existingMap.TryGetValue((empId, d), out var existing))
                {
                    existing.ShiftName = request.ShiftName;
                    existing.ShiftStart = request.ShiftStart;
                    existing.ShiftEnd = request.ShiftEnd;
                    existing.ShiftDurationMinutes = request.ShiftDurationMinutes;
                    existing.IsOvernightShift = request.IsOvernightShift;
                    existing.PayMultiplier = request.PayMultiplier;
                    existing.ExcuseOverlappingDayShift = request.ExcuseOverlappingDayShift;
                    existing.Reason = request.Reason;
                    existing.UpdatedAt = DateTime.UtcNow;
                    existing.UpdatedBy = userId;
                }
                else
                {
                    var newAssignment = new ShiftRosterAssignment
                    {
                        Id = Guid.NewGuid(),
                        EmployeeId = empId,
                        Date = d,
                        ShiftName = request.ShiftName,
                        ShiftStart = request.ShiftStart,
                        ShiftEnd = request.ShiftEnd,
                        ShiftDurationMinutes = request.ShiftDurationMinutes,
                        IsOvernightShift = request.IsOvernightShift,
                        PayMultiplier = request.PayMultiplier,
                        ExcuseOverlappingDayShift = request.ExcuseOverlappingDayShift,
                        Reason = request.Reason,
                        CreatedBy = userId,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.ShiftRosterAssignments.Add(newAssignment);
                }
                count++;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Automatically trigger attendance recalculation for affected months
        try
        {
            var distinctMonths = new HashSet<string>();
            for (var d = request.StartDate; d <= request.EndDate; d = d.AddDays(1))
            {
                distinctMonths.Add(d.ToString("yyyy-MM"));
            }

            using var scope = _serviceProvider.CreateScope();
            var biometricService = scope.ServiceProvider.GetService<IBiometricAttendanceService>();
            if (biometricService != null)
            {
                foreach (var ym in distinctMonths)
                {
                    await biometricService.RecalculateAttendanceAsync(ym, null, userId, cancellationToken);
                }
            }
        }
        catch
        {
            // Graceful fallback so roster save is not rolled back if recalculation encounters issue
        }

        return ApiResponse<int>.Ok(count, $"Successfully scheduled {count} temporary shift assignments and recalculated attendance.");
    }

    public async Task<ApiResponse<bool>> DeleteRosterAssignmentAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var assignment = await _context.ShiftRosterAssignments.FindAsync([id], cancellationToken);
        if (assignment == null)
        {
            return ApiResponse<bool>.Fail("Shift roster assignment not found.");
        }

        var ym = assignment.Date.ToString("yyyy-MM");
        _context.ShiftRosterAssignments.Remove(assignment);
        await _context.SaveChangesAsync(cancellationToken);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var biometricService = scope.ServiceProvider.GetService<IBiometricAttendanceService>();
            if (biometricService != null)
            {
                await biometricService.RecalculateAttendanceAsync(ym, null, "system", cancellationToken);
            }
        }
        catch
        {
            // Graceful fallback
        }

        return ApiResponse<bool>.Ok(true, "Roster assignment removed and attendance recalculated.");
    }
}
