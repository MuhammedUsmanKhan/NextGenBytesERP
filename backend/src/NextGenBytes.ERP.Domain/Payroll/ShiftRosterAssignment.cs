namespace NextGenBytes.ERP.Domain.Payroll;

public sealed class ShiftRosterAssignment
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public DateOnly Date { get; set; }
    public string ShiftName { get; set; } = "Temporary Night Duty";
    public TimeOnly ShiftStart { get; set; } = new(18, 0);
    public TimeOnly ShiftEnd { get; set; } = new(8, 0);
    public int ShiftDurationMinutes { get; set; } = 840; // 14 hours standard
    public bool IsOvernightShift { get; set; } = true;

    // Supervisor-configured multiplier (e.g. 1.5 standard or 1.0 flat)
    public decimal PayMultiplier { get; set; } = 1.5m;

    // Post-night rest protection: automatically excuse overlapping daytime shift
    public bool ExcuseOverlappingDayShift { get; set; } = true;

    public string? Reason { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

