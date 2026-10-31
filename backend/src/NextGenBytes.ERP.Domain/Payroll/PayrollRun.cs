using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Domain.Payroll;

public sealed class PayrollRun
{
    public Guid Id { get; set; }
    public string MonthYear { get; set; } = string.Empty; // "YYYY-MM"
    public string? DepartmentCategory { get; set; }
    public DateTime RunDate { get; set; } = DateTime.UtcNow;
    public PayrollRunStatus Status { get; set; } = PayrollRunStatus.Draft;

    public decimal TotalGrossSalary { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal TotalDueGross { get; set; }
    public decimal TotalDueGrossRounded { get; set; }
    public decimal TotalLoansAndAdvances { get; set; }
    public decimal TotalNetSalary { get; set; }

    public string? Notes { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public ICollection<Payslip> Payslips { get; set; } = [];

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

