using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.DTOs;

public static class AttendanceMappingExtensions
{
    public static AttendanceSummaryResponse ToResponse(
        this AttendanceSummary summary,
        Employee employee,
        EmployeeContract? activeContract)
    {
        return new AttendanceSummaryResponse
        {
            Id = summary.Id,
            EmployeeId = employee.Id,
            EmployeeCode = employee.Code,
            EmployeeName = employee.FullName,
            Category = employee.Category,
            DepartmentName = employee.Department?.Name,
            PayType = activeContract?.PayType ?? PayType.Monthly,
            BasicRate = activeContract?.BasicRate ?? 0m,
            DailyShiftHours = activeContract?.DailyShiftHours ?? (employee.Category == "Office Staff" ? 9m : 10m),
            DefaultNightShiftMinutes = activeContract?.NightShiftMinutes ?? 840,
            MonthYear = summary.MonthYear,
            DaysPresent = summary.DaysPresent,
            AbsentDays = summary.AbsentDays,
            LateMinutes = summary.LateMinutes,
            OvertimeHours = summary.OvertimeHours,
            OvertimeMinutes = summary.OvertimeMinutes,
            NightShiftsCount = summary.NightShiftsCount,
            NightShiftMinutes = summary.NightShiftMinutes,
            PendingExceptionsCount = summary.PendingExceptionsCount,
            PendingOvertimeMinutes = summary.PendingOvertimeMinutes,
            UpdatedAt = summary.UpdatedAt ?? summary.CreatedAt
        };
    }

    public static AttendanceSummaryResponse ToDefaultResponse(
        this Employee employee,
        string monthYear,
        EmployeeContract? activeContract)
    {
        return new AttendanceSummaryResponse
        {
            Id = Guid.Empty,
            EmployeeId = employee.Id,
            EmployeeCode = employee.Code,
            EmployeeName = employee.FullName,
            Category = employee.Category,
            DepartmentName = employee.Department?.Name,
            PayType = activeContract?.PayType ?? PayType.Monthly,
            BasicRate = activeContract?.BasicRate ?? 0m,
            DailyShiftHours = activeContract?.DailyShiftHours ?? (employee.Category == "Office Staff" ? 9m : 10m),
            DefaultNightShiftMinutes = activeContract?.NightShiftMinutes ?? 840,
            MonthYear = monthYear,
            DaysPresent = 0m,
            AbsentDays = 0m,
            LateMinutes = 0,
            OvertimeHours = 0m,
            OvertimeMinutes = 0,
            NightShiftsCount = 0,
            NightShiftMinutes = 0,
            PendingExceptionsCount = 0,
            PendingOvertimeMinutes = 0,
            UpdatedAt = null
        };
    }
}
