using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.DTOs;

public sealed record ParsedPunchDto(
    string BiometricDeviceId,
    DateTime Timestamp,
    int TerminalId,
    int PunchState,
    int WorkCode
);

public sealed class BiometricUploadResponse
{
    public string BatchId { get; init; } = string.Empty;
    public int TotalLinesRead { get; init; }
    public int ValidPunchesImported { get; init; }
    public int DiscardedResetPunches { get; init; } // Date < 2020-01-01
    public int UnmappedPunches { get; init; } // Machine IDs not mapped to an Employee
    public int DailyRecordsCreated { get; init; }
    public int ExceptionsFlagged { get; init; } // Single punch missing, out of shift, etc.
    public List<string> UnmappedBiometricIds { get; init; } = [];
}

public sealed class DailyAttendanceResponse
{
    public Guid Id { get; init; }
    public Guid EmployeeId { get; init; }
    public string EmployeeCode { get; init; } = string.Empty;
    public string EmployeeName { get; init; } = string.Empty;
    public string? DepartmentName { get; init; }
    public string? ShiftName { get; init; }

    public DateOnly Date { get; init; }
    public TimeOnly? FirstPunchIn { get; init; }
    public TimeOnly? LastPunchOut { get; init; }
    public int TotalPunches { get; init; }

    public int LateMinutes { get; init; }
    public int EarlyLeaveMinutes { get; init; }
    public int WorkedMinutes { get; init; }
    public int OvertimeMinutes { get; init; }

    public bool IsNightShift { get; init; }
    public bool IsAbsent { get; init; }
    public bool IsWeekend { get; init; }
    public bool IsHoliday { get; init; }

    public bool HasException { get; init; }
    public bool IsSinglePunchMissing { get; init; }
    public string? ExceptionType { get; init; }
    public bool IsExcusedPostNightRest { get; init; }
    public decimal? ShiftPayMultiplier { get; init; }
    public bool IsBaseWageApproved { get; init; }
    public bool IsOvertimeApproved { get; init; }
    public int PendingOvertimeMinutes { get; init; }
    public decimal? PendingPayMultiplier { get; init; }
    public bool IsResolved { get; init; }
    public string? ResolvedBy { get; init; }
    public DateTime? ResolvedAt { get; init; }
    public string? ResolutionNotes { get; init; }

    public string Source { get; init; } = "DAT_IMPORT";
}

public sealed class BulkResolveExceptionsRequest
{
    public List<Guid> DailyAttendanceIds { get; init; } = [];
    public TimeOnly? DefaultSuggestedPunchOut { get; init; }
    public bool UseRosterShiftEndIfAvailable { get; init; } = true;
    public bool ApproveBaseWage { get; init; } = true;
    public bool ApproveOvertimePremium { get; init; } = false;
    public decimal ApprovedMultiplier { get; init; } = 1.5m;
    public string SupervisorNotes { get; init; } = string.Empty;
}

public sealed class BulkResolvePreviewItem
{
    public Guid DailyAttendanceId { get; init; }
    public Guid EmployeeId { get; init; }
    public string EmployeeCode { get; init; } = string.Empty;
    public string EmployeeName { get; init; } = string.Empty;
    public string? DepartmentName { get; init; }
    public DateOnly Date { get; init; }
    public TimeOnly? RecordedPunchIn { get; init; }
    public TimeOnly? SuggestedPunchOut { get; init; }
    public string SuggestedSource { get; init; } = string.Empty; // "ROSTER_SHIFT_END", "DEFAULT_SHIFT_END"
    public int ComputedWorkedMinutes { get; init; }
    public bool IsNightShift { get; init; }
    public decimal ProposedMultiplier { get; init; }
}

public sealed class AttendanceExceptionResponse
{
    public Guid DailyAttendanceId { get; init; }
    public Guid EmployeeId { get; init; }
    public string EmployeeCode { get; init; } = string.Empty;
    public string EmployeeName { get; init; } = string.Empty;
    public string? DepartmentName { get; init; }
    public string? BiometricDeviceId { get; init; }

    public DateOnly Date { get; init; }
    public TimeOnly? RecordedPunchIn { get; init; }
    public TimeOnly? RecordedPunchOut { get; init; }
    public TimeOnly? FirstPunchIn { get; init; }
    public TimeOnly? LastPunchOut { get; init; }
    public bool IsSinglePunchMissing { get; init; }
    public string ExceptionType { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;

    public bool IsResolved { get; init; }
    public string? ResolutionNotes { get; init; }
}

public sealed class ResolveAttendanceExceptionRequest
{
    public TimeOnly? CorrectedPunchIn { get; init; }
    public TimeOnly? CorrectedPunchOut { get; init; }
    public bool? ApproveAsNightShift { get; init; }
    public bool? ApproveOvertime { get; init; }
    public decimal? ApprovedMultiplier { get; init; }
    public string ResolutionNotes { get; init; } = string.Empty;
}

public sealed class ShiftDefinitionDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public Guid? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }

    public TimeOnly ShiftStart { get; init; }
    public TimeOnly ShiftEnd { get; init; }
    public int ShiftDurationMinutes { get; init; }

    public int GraceLateMinutes { get; init; }
    public GraceDeductionMode GraceMode { get; init; }

    public bool IsOvernightShift { get; init; }
    public TimeOnly NightShiftStart { get; init; }
    public TimeOnly NightShiftEnd { get; init; }

    public bool IsActive { get; init; }
    public int AssignedEmployeeCount { get; init; }
}

public sealed class CreateShiftDefinitionRequest
{
    public string Name { get; init; } = string.Empty;
    public Guid? DepartmentId { get; init; }

    public TimeOnly ShiftStart { get; init; }
    public TimeOnly ShiftEnd { get; init; }
    public int ShiftDurationMinutes { get; init; }

    public int GraceLateMinutes { get; init; } = 10;
    public GraceDeductionMode GraceMode { get; init; } = GraceDeductionMode.DeductAllFromStart;

    public bool IsOvernightShift { get; init; } = false;
    public TimeOnly NightShiftStart { get; init; } = new(18, 0);
    public TimeOnly NightShiftEnd { get; init; } = new(6, 0);
}

public sealed class UpdateShiftDefinitionRequest
{
    public string Name { get; init; } = string.Empty;
    public Guid? DepartmentId { get; init; }

    public TimeOnly ShiftStart { get; init; }
    public TimeOnly ShiftEnd { get; init; }
    public int ShiftDurationMinutes { get; init; }

    public int GraceLateMinutes { get; init; }
    public GraceDeductionMode GraceMode { get; init; }

    public bool IsOvernightShift { get; init; }
    public TimeOnly NightShiftStart { get; init; }
    public TimeOnly NightShiftEnd { get; init; }

    public bool IsActive { get; init; }
}

