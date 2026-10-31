using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.DTOs;

public sealed class AttendanceSummaryResponse
{
    public Guid Id { get; init; }
    public Guid EmployeeId { get; init; }
    public string EmployeeCode { get; init; } = string.Empty;
    public string EmployeeName { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string? DepartmentName { get; init; }
    public PayType PayType { get; init; }
    public decimal BasicRate { get; init; }
    public decimal DailyShiftHours { get; init; }
    public int DefaultNightShiftMinutes { get; init; }

    public string MonthYear { get; init; } = string.Empty; // "YYYY-MM"
    public decimal DaysPresent { get; init; }
    public decimal AbsentDays { get; init; }
    public int LateMinutes { get; init; }
    public decimal OvertimeHours { get; init; }
    public int OvertimeMinutes { get; init; }
    public int NightShiftsCount { get; init; }
    public int NightShiftMinutes { get; init; }
    public int PendingExceptionsCount { get; init; }
    public int PendingOvertimeMinutes { get; init; }

    public DateTime? UpdatedAt { get; init; }
}

public sealed class UpsertAttendanceItem
{
    public Guid EmployeeId { get; init; }
    public decimal DaysPresent { get; init; }
    public decimal AbsentDays { get; init; }
    public int LateMinutes { get; init; }
    public int OvertimeMinutes { get; init; }
    public decimal OvertimeHours { get; init; }
    public int NightShiftsCount { get; init; }
    public int? NightShiftMinutes { get; init; } // Optional override, defaults to (NightShiftsCount * contract's NightShiftMinutes)
}

public sealed class UpsertAttendanceRequest
{
    public string MonthYear { get; init; } = string.Empty; // "YYYY-MM"
    public UpsertAttendanceItem Item { get; init; } = null!;
}

public sealed class BulkUpsertAttendanceRequest
{
    public string MonthYear { get; init; } = string.Empty; // "YYYY-MM"
    public List<UpsertAttendanceItem> Items { get; init; } = [];
}
