using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.DTOs;

public sealed class EmployeeContractResponse
{
    public Guid Id { get; init; }
    public Guid EmployeeId { get; init; }
    public PayType PayType { get; init; }
    public DisbursementType DisbursementType { get; init; }
    public decimal BasicRate { get; init; }
    public decimal AttendanceAllowance { get; init; }
    public decimal OtherAllowances { get; init; }
    public int MonthlyDivisorDays { get; init; }
    public decimal DailyShiftHours { get; init; }
    public int NightShiftMinutes { get; init; }
    public AbsencePolicy AbsencePolicy { get; init; }
    public int GraceAbsentDays { get; init; }
    public bool OvertimeEligible { get; init; }
    public decimal OvertimeMultiplier { get; init; }
    public RoundingMode RoundingMode { get; init; }
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public DateTime EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
}

public sealed class EmployeeResponse
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string? CNIC { get; init; }
    public string? Phone { get; init; }
    public Guid? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public string? Designation { get; init; }
    public string? BiometricDeviceId { get; init; }
    public Guid? ShiftDefinitionId { get; init; }
    public string? ShiftName { get; init; }
    public string Category { get; init; } = "Salaries Labor";
    public DateTime? DateOfJoining { get; init; }
    public string Status { get; init; } = "Active";
    public EmployeeContractResponse? ActiveContract { get; init; }
    public DateTime CreatedAt { get; init; }
}

