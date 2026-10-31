namespace NextGenBytes.ERP.Domain.Payroll;

public sealed class AttendanceSummary
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public string MonthYear { get; set; } = string.Empty; // "YYYY-MM"
    public decimal DaysPresent { get; set; }
    public decimal AbsentDays { get; set; }
    public int LateMinutes { get; set; }
    public decimal OvertimeHours { get; set; }
    public int OvertimeMinutes { get; set; }
    public int NightShiftsCount { get; set; }
    public int NightShiftMinutes { get; set; }
    public int PendingExceptionsCount { get; set; }
    public int PendingOvertimeMinutes { get; set; }
    public decimal PendingOvertimeHours => Math.Round((decimal)PendingOvertimeMinutes / 60m, 2);

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

