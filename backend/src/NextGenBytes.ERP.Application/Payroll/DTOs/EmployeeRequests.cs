using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.DTOs;

public sealed class CreateEmployeeRequest
{
    public string? Code { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string? CNIC { get; init; }
    public string? Phone { get; init; }
    public Guid? DepartmentId { get; init; }
    public string? Designation { get; init; }
    public string? BiometricDeviceId { get; init; }
    public Guid? ShiftDefinitionId { get; init; }
    public string Category { get; init; } = "Salaries Labor"; // Office Staff, Salaries Labor, Daily Wages
    public DateTime? DateOfJoining { get; init; }
    public string Status { get; init; } = "Active";

    // Initial Contract Settings
    public bool CreateContract { get; init; } = true;
    public PayType PayType { get; init; } = PayType.Monthly;
    public DisbursementType DisbursementType { get; init; } = DisbursementType.Cash;
    public decimal BasicRate { get; init; }
    public decimal AttendanceAllowance { get; init; } = 0m;
    public decimal OtherAllowances { get; init; } = 0m;
    public int MonthlyDivisorDays { get; init; } = 30;
    public decimal DailyShiftHours { get; init; } = 10m;
    public int NightShiftMinutes { get; init; } = 840; // 840 = 14h, 720 = 12h
    public AbsencePolicy AbsencePolicy { get; init; } = AbsencePolicy.ThresholdGrace_DeductAllIfExceeded;
    public int GraceAbsentDays { get; init; } = 1;
    public bool OvertimeEligible { get; init; } = true;
    public decimal OvertimeMultiplier { get; init; } = 1.5m;
    public RoundingMode RoundingMode { get; init; } = RoundingMode.Ceiling10;
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public DateTime? EffectiveFrom { get; init; }
}

public sealed class UpdateEmployeeRequest
{
    public string FullName { get; init; } = string.Empty;
    public string? CNIC { get; init; }
    public string? Phone { get; init; }
    public Guid? DepartmentId { get; init; }
    public string? Designation { get; init; }
    public string? BiometricDeviceId { get; init; }
    public Guid? ShiftDefinitionId { get; init; }
    public string Category { get; init; } = "Salaries Labor";
    public DateTime? DateOfJoining { get; init; }
    public string Status { get; init; } = "Active";
}

public sealed class CreateContractRequest
{
    public PayType PayType { get; init; } = PayType.Monthly;
    public DisbursementType DisbursementType { get; init; } = DisbursementType.Cash;
    public decimal BasicRate { get; init; }
    public decimal AttendanceAllowance { get; init; } = 0m;
    public decimal OtherAllowances { get; init; } = 0m;
    public int MonthlyDivisorDays { get; init; } = 30;
    public decimal DailyShiftHours { get; init; } = 10m;
    public int NightShiftMinutes { get; init; } = 840;
    public AbsencePolicy AbsencePolicy { get; init; } = AbsencePolicy.ThresholdGrace_DeductAllIfExceeded;
    public int GraceAbsentDays { get; init; } = 1;
    public bool OvertimeEligible { get; init; } = true;
    public decimal OvertimeMultiplier { get; init; } = 1.5m;
    public RoundingMode RoundingMode { get; init; } = RoundingMode.Ceiling10;
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public DateTime? EffectiveFrom { get; init; }
}

