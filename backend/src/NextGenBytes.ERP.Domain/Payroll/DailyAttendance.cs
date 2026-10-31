namespace NextGenBytes.ERP.Domain.Payroll;

public sealed class DailyAttendance
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public DateOnly Date { get; set; }
    public TimeOnly? FirstPunchIn { get; set; }
    public TimeOnly? LastPunchOut { get; set; }
    public int TotalPunches { get; set; }

    public int LateMinutes { get; set; }
    public int EarlyLeaveMinutes { get; set; }
    public int WorkedMinutes { get; set; }
    public int OvertimeMinutes { get; set; }

    public bool IsNightShift { get; set; }
    public bool IsAbsent { get; set; }
    public bool IsWeekend { get; set; }
    public bool IsHoliday { get; set; }
    public bool IsExcusedPostNightRest { get; set; }
    public decimal? ShiftPayMultiplier { get; set; }

    // Tier 2 & Tier 3 Separation Flags
    public bool IsBaseWageApproved { get; set; } = true;
    public bool IsOvertimeApproved { get; set; } = false;
    public int PendingOvertimeMinutes { get; set; } = 0;
    public decimal? PendingPayMultiplier { get; set; }

    // Exception tracking & HR resolution
    public bool HasException { get; set; }
    public bool IsSinglePunchMissing { get; set; }
    public bool IsIncompleteShift => IsSinglePunchMissing && !IsResolved;
    public string? ExceptionType { get; set; } // "SINGLE_PUNCH_MISSING", "UNMAPPED_DEVICE_ID", "SHIFT_MISMATCH"
    public bool IsResolved { get; set; }
    public string? ResolvedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionNotes { get; set; }

    public string Source { get; set; } = "DAT_IMPORT"; // "DAT_IMPORT", "MANUAL", "API_PUSH"
    public string? ImportBatchId { get; set; }

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

