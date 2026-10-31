using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Domain.Payroll;

public sealed class Payslip
{
    public Guid Id { get; set; }
    public Guid PayrollRunId { get; set; }
    public PayrollRun PayrollRun { get; set; } = null!;

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public string EmployeeNameSnapshot { get; set; } = string.Empty;
    public string DepartmentSnapshot { get; set; } = string.Empty;
    public PayType PayTypeSnapshot { get; set; } = PayType.Monthly;
    public DisbursementType DisbursementType { get; set; } = DisbursementType.Cash;

    // Snapshot contract rates & earnings
    public decimal BasicRate { get; set; }
    public decimal AttendanceAllowance { get; set; }
    public decimal OtherAllowances { get; set; }
    public decimal GrossSalary { get; set; }

    // Attendance inputs & calculated components
    public decimal DaysPresent { get; set; }
    public decimal AbsentDays { get; set; }
    public decimal AbsentDeduction { get; set; }
    public int LateMinutes { get; set; }
    public decimal LateDeduction { get; set; }
    public int NightShiftsCount { get; set; }
    public int NightShiftMinutes { get; set; }
    public decimal NightShiftAmount { get; set; }
    public int OvertimeMinutes { get; set; }
    public decimal OvertimeAmount { get; set; }

    // Net calculations
    public decimal TotalDeductions { get; set; }
    public decimal DueGrossSalary { get; set; }
    public decimal DueGrossSalaryRounded { get; set; }
    public decimal LoanDeduction { get; set; }
    public decimal AdvanceSalaryDeduction { get; set; }
    public decimal TotalLess { get; set; }
    public decimal NetSalary { get; set; }

    public PayslipDenomination? Denomination { get; set; }

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

