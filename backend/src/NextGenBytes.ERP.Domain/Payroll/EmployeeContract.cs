using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Domain.Payroll;

public sealed class EmployeeContract
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public PayType PayType { get; set; } = PayType.Monthly;
    public DisbursementType DisbursementType { get; set; } = DisbursementType.Cash;

    public decimal BasicRate { get; set; }
    public decimal AttendanceAllowance { get; set; }
    public decimal OtherAllowances { get; set; }

    public int MonthlyDivisorDays { get; set; } = 30;
    public decimal DailyShiftHours { get; set; } = 10m;
    public int NightShiftMinutes { get; set; } = 840; // 14 hours default, 720 for 12 hours

    public AbsencePolicy AbsencePolicy { get; set; } = AbsencePolicy.ThresholdGrace_DeductAllIfExceeded;
    public int GraceAbsentDays { get; set; } = 1;

    public bool OvertimeEligible { get; set; } = true;
    public decimal OvertimeMultiplier { get; set; } = 1.5m;
    public RoundingMode RoundingMode { get; set; } = RoundingMode.Ceiling10;

    public string? BankName { get; set; }
    public string? BankAccountNumber { get; set; }

    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

