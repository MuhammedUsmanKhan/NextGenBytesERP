using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Interfaces;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Payroll.Services;

public sealed class AttendanceService : IAttendanceService
{
    private readonly AppDbContext _context;

    public AttendanceService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<AttendanceSummaryResponse>>> GetMonthAttendanceAsync(
        string monthYear,
        string? category = null,
        Guid? departmentId = null,
        string? search = null)
    {
        if (string.IsNullOrWhiteSpace(monthYear))
            monthYear = DateTime.UtcNow.ToString("yyyy-MM");

        IQueryable<Employee> empQuery = _context.Employees
            .AsNoTracking()
            .Include(x => x.Department)
            .Include(x => x.Contracts.Where(c => c.IsActive))
            .Where(x => x.Status == "Active");

        if (!string.IsNullOrWhiteSpace(category))
            empQuery = empQuery.Where(x => x.Category == category);

        if (departmentId.HasValue)
            empQuery = empQuery.Where(x => x.DepartmentId == departmentId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            empQuery = empQuery.Where(x =>
                x.FullName.Contains(s) ||
                x.Code.Contains(s) ||
                (x.CNIC != null && x.CNIC.Contains(s)));
        }

        var employees = await empQuery
            .OrderBy(x => x.Code)
            .ToListAsync();

        var empIds = employees.Select(x => x.Id).ToList();

        var summaries = await _context.AttendanceSummaries
            .AsNoTracking()
            .Where(x => x.MonthYear == monthYear && empIds.Contains(x.EmployeeId))
            .ToDictionaryAsync(x => x.EmployeeId);

        var result = new List<AttendanceSummaryResponse>(employees.Count);

        foreach (var emp in employees)
        {
            var activeContract = emp.Contracts.FirstOrDefault(c => c.IsActive);

            if (summaries.TryGetValue(emp.Id, out var summary))
            {
                result.Add(summary.ToResponse(emp, activeContract));
            }
            else
            {
                result.Add(emp.ToDefaultResponse(monthYear, activeContract));
            }
        }

        return ApiResponse<List<AttendanceSummaryResponse>>.Ok(result);
    }

    public async Task<ApiResponse<AttendanceSummaryResponse>> UpsertAsync(
        UpsertAttendanceRequest request,
        string userId)
    {
        if (string.IsNullOrWhiteSpace(request.MonthYear))
            return ApiResponse<AttendanceSummaryResponse>.Fail("MonthYear is required (format: YYYY-MM).");

        var employee = await _context.Employees
            .Include(x => x.Department)
            .Include(x => x.Contracts.Where(c => c.IsActive))
            .FirstOrDefaultAsync(x => x.Id == request.Item.EmployeeId);

        if (employee is null)
            return ApiResponse<AttendanceSummaryResponse>.Fail($"Employee with ID '{request.Item.EmployeeId}' was not found.");

        var activeContract = employee.Contracts.FirstOrDefault(c => c.IsActive);
        var summary = await _context.AttendanceSummaries
            .FirstOrDefaultAsync(x => x.EmployeeId == request.Item.EmployeeId && x.MonthYear == request.MonthYear);

        var defaultNightMins = activeContract?.NightShiftMinutes ?? 840;
        var nightMins = request.Item.NightShiftMinutes ?? (request.Item.NightShiftsCount * defaultNightMins);

        // Normalize OT hours vs minutes
        var otMinutes = request.Item.OvertimeMinutes;
        var otHours = request.Item.OvertimeHours;

        if (otMinutes > 0 && otHours == 0m)
            otHours = Math.Round((decimal)otMinutes / 60m, 2);
        else if (otHours > 0m && otMinutes == 0)
            otMinutes = (int)Math.Round(otHours * 60m);

        var now = DateTime.UtcNow;

        if (summary is null)
        {
            summary = new AttendanceSummary
            {
                Id = Guid.NewGuid(),
                EmployeeId = request.Item.EmployeeId,
                MonthYear = request.MonthYear,
                DaysPresent = request.Item.DaysPresent,
                AbsentDays = request.Item.AbsentDays,
                LateMinutes = request.Item.LateMinutes,
                OvertimeHours = otHours,
                OvertimeMinutes = otMinutes,
                NightShiftsCount = request.Item.NightShiftsCount,
                NightShiftMinutes = nightMins,
                CreatedAt = now,
                CreatedBy = userId
            };
            _context.AttendanceSummaries.Add(summary);
        }
        else
        {
            summary.DaysPresent = request.Item.DaysPresent;
            summary.AbsentDays = request.Item.AbsentDays;
            summary.LateMinutes = request.Item.LateMinutes;
            summary.OvertimeHours = otHours;
            summary.OvertimeMinutes = otMinutes;
            summary.NightShiftsCount = request.Item.NightShiftsCount;
            summary.NightShiftMinutes = nightMins;
            summary.UpdatedAt = now;
            summary.UpdatedBy = userId;
        }

        await _context.SaveChangesAsync();

        return ApiResponse<AttendanceSummaryResponse>.Ok(
            summary.ToResponse(employee, activeContract),
            "Attendance record saved successfully.");
    }

    public async Task<ApiResponse<int>> BulkUpsertAsync(
        BulkUpsertAttendanceRequest request,
        string userId)
    {
        if (string.IsNullOrWhiteSpace(request.MonthYear))
            return ApiResponse<int>.Fail("MonthYear is required (format: YYYY-MM).");

        if (request.Items == null || request.Items.Count == 0)
            return ApiResponse<int>.Ok(0, "No attendance items provided.");

        var empIds = request.Items.Select(x => x.EmployeeId).Distinct().ToList();

        var employees = await _context.Employees
            .Include(x => x.Contracts.Where(c => c.IsActive))
            .Where(x => empIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id);

        var existingSummaries = await _context.AttendanceSummaries
            .Where(x => x.MonthYear == request.MonthYear && empIds.Contains(x.EmployeeId))
            .ToDictionaryAsync(x => x.EmployeeId);

        var now = DateTime.UtcNow;
        var count = 0;

        foreach (var item in request.Items)
        {
            if (!employees.TryGetValue(item.EmployeeId, out var emp))
                continue;

            var activeContract = emp.Contracts.FirstOrDefault(c => c.IsActive);
            var defaultNightMins = activeContract?.NightShiftMinutes ?? 840;
            var nightMins = item.NightShiftMinutes ?? (item.NightShiftsCount * defaultNightMins);

            var otMinutes = item.OvertimeMinutes;
            var otHours = item.OvertimeHours;

            if (otMinutes > 0 && otHours == 0m)
                otHours = Math.Round((decimal)otMinutes / 60m, 2);
            else if (otHours > 0m && otMinutes == 0)
                otMinutes = (int)Math.Round(otHours * 60m);

            if (existingSummaries.TryGetValue(item.EmployeeId, out var existing))
            {
                existing.DaysPresent = item.DaysPresent;
                existing.AbsentDays = item.AbsentDays;
                existing.LateMinutes = item.LateMinutes;
                existing.OvertimeHours = otHours;
                existing.OvertimeMinutes = otMinutes;
                existing.NightShiftsCount = item.NightShiftsCount;
                existing.NightShiftMinutes = nightMins;
                existing.UpdatedAt = now;
                existing.UpdatedBy = userId;
            }
            else
            {
                var newSummary = new AttendanceSummary
                {
                    Id = Guid.NewGuid(),
                    EmployeeId = item.EmployeeId,
                    MonthYear = request.MonthYear,
                    DaysPresent = item.DaysPresent,
                    AbsentDays = item.AbsentDays,
                    LateMinutes = item.LateMinutes,
                    OvertimeHours = otHours,
                    OvertimeMinutes = otMinutes,
                    NightShiftsCount = item.NightShiftsCount,
                    NightShiftMinutes = nightMins,
                    CreatedAt = now,
                    CreatedBy = userId
                };
                _context.AttendanceSummaries.Add(newSummary);
            }
            count++;
        }

        await _context.SaveChangesAsync();
        return ApiResponse<int>.Ok(count, $"{count} attendance records saved successfully.");
    }
}
