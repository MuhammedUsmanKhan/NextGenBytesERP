using NextGenBytes.ERP.Domain.Definitions;

namespace NextGenBytes.ERP.Domain.Payroll;

public sealed class Employee
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? BiometricDeviceId { get; set; } // ZKTeco / Biometric Machine PIN
    public string? CNIC { get; set; }
    public string? Phone { get; set; }

    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public Guid? ShiftDefinitionId { get; set; } // Optional individual shift override
    public ShiftDefinition? ShiftDefinition { get; set; }

    public string? Designation { get; set; }
    public string Category { get; set; } = "Salaries Labor"; // Office Staff, Salaries Labor, Daily Wages
    public DateTime? DateOfJoining { get; set; }
    public string Status { get; set; } = "Active"; // Active, Inactive, Terminated

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    public ICollection<EmployeeContract> Contracts { get; set; } = [];
    public ICollection<AttendanceSummary> AttendanceSummaries { get; set; } = [];
    public ICollection<DailyAttendance> DailyAttendances { get; set; } = [];
    public ICollection<RawPunchLog> RawPunchLogs { get; set; } = [];
    public ICollection<LoanAndAdvance> LoansAndAdvances { get; set; } = [];
    public ICollection<Payslip> Payslips { get; set; } = [];
}

