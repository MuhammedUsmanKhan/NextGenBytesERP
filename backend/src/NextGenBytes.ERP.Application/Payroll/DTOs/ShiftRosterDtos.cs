namespace NextGenBytes.ERP.Application.Payroll.DTOs;

public sealed class ShiftRosterAssignmentDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public DateOnly Date { get; set; }
    public string ShiftName { get; set; } = string.Empty;
    public TimeOnly ShiftStart { get; set; }
    public TimeOnly ShiftEnd { get; set; }
    public int ShiftDurationMinutes { get; set; }
    public bool IsOvernightShift { get; set; }
    public decimal PayMultiplier { get; set; }
    public bool ExcuseOverlappingDayShift { get; set; }
    public string? Reason { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public sealed class BulkAssignRosterRequest
{
    public List<Guid> EmployeeIds { get; set; } = [];
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string ShiftName { get; set; } = "Factory Night Shift (14h)";
    public TimeOnly ShiftStart { get; set; } = new(18, 0);
    public TimeOnly ShiftEnd { get; set; } = new(8, 0);
    public int ShiftDurationMinutes { get; set; } = 840;
    public bool IsOvernightShift { get; set; } = true;
    public decimal PayMultiplier { get; set; } = 1.5m;
    public bool ExcuseOverlappingDayShift { get; set; } = true;
    public string? Reason { get; set; }
}

public sealed class ShiftRosterCalendarResponse
{
    public string MonthYear { get; set; } = string.Empty;
    public List<ShiftRosterAssignmentDto> Assignments { get; set; } = [];
    public int TotalAssignedNights { get; set; }
    public int TotalWorkersScheduled { get; set; }
}

