using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.DTOs;

public sealed class PayslipDenominationResponse
{
    public int Note5000 { get; init; }
    public int Note1000 { get; init; }
    public int Note500 { get; init; }
    public int Note100 { get; init; }
    public int Note50 { get; init; }
    public int Note20 { get; init; }
    public int Note10 { get; init; }
    public int CoinsRemainder { get; init; }
    public decimal TotalAmount =>
        (Note5000 * 5000) + (Note1000 * 1000) + (Note500 * 500) +
        (Note100 * 100) + (Note50 * 50) + (Note20 * 20) + (Note10 * 10) + CoinsRemainder;
}

public sealed class PayslipResponse
{
    public Guid Id { get; init; }
    public Guid PayrollRunId { get; init; }
    public Guid EmployeeId { get; init; }
    public string EmployeeCode { get; init; } = string.Empty;
    public string EmployeeName { get; init; } = string.Empty;
    public string DepartmentName { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public PayType PayType { get; init; }
    public DisbursementType DisbursementType { get; init; }

    // Rates & Basic Earnings
    public decimal BasicRate { get; init; }
    public decimal AttendanceAllowance { get; init; }
    public decimal OtherAllowances { get; init; }
    public decimal GrossSalary { get; init; }

    // Attendance inputs & additions/deductions
    public decimal DaysPresent { get; init; }
    public decimal AbsentDays { get; init; }
    public decimal AbsentDeduction { get; init; }
    public int LateMinutes { get; init; }
    public decimal LateDeduction { get; init; }
    public int NightShiftsCount { get; init; }
    public int NightShiftMinutes { get; init; }
    public decimal NightShiftAmount { get; init; }
    public int OvertimeMinutes { get; init; }
    public decimal OvertimeAmount { get; init; }

    // Intermediates
    public decimal TotalDeductions { get; init; }
    public decimal DueGrossSalary { get; init; }
    public decimal DueGrossSalaryRounded { get; init; }

    // Loans & Advances
    public decimal LoanDeduction { get; init; }
    public decimal AdvanceSalaryDeduction { get; init; }
    public decimal TotalLess { get; init; }
    public decimal NetSalary { get; init; }

    public PayslipDenominationResponse? Denomination { get; init; }
}

public sealed class PayrollRunResponse
{
    public Guid Id { get; init; }
    public string MonthYear { get; init; } = string.Empty;
    public string? DepartmentCategory { get; init; }
    public DateTime RunDate { get; init; }
    public PayrollRunStatus Status { get; init; }

    public int EmployeeCount { get; init; }
    public decimal TotalGrossSalary { get; init; }
    public decimal TotalDeductions { get; init; }
    public decimal TotalDueGross { get; init; }
    public decimal TotalDueGrossRounded { get; init; }
    public decimal TotalLoansAndAdvances { get; init; }
    public decimal TotalNetSalary { get; init; }

    public string? Notes { get; init; }
    public string? ApprovedBy { get; init; }
    public DateTime? ApprovedAt { get; init; }
    public DateTime CreatedAt { get; init; }
}

public sealed class PayrollRunDetailResponse
{
    public PayrollRunResponse Run { get; init; } = null!;
    public List<PayslipResponse> Payslips { get; init; } = [];
    public PayslipDenominationResponse TotalDenominations { get; init; } = new();
}

public sealed class CreatePayrollRunRequest
{
    public string MonthYear { get; init; } = string.Empty; // "YYYY-MM"
    public string? DepartmentCategory { get; init; } // Optional filter, e.g. "Office Staff", "Salaries Labor", "Daily Wages"
    public string? Notes { get; init; }
}

