using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Domain.Payroll;

public sealed class LoanAndAdvance
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public LoanType Type { get; set; } = LoanType.SalaryAdvance;
    public decimal TotalAmount { get; set; }
    public decimal MonthlyDeduction { get; set; }
    public decimal RemainingBalance { get; set; }
    public DateTime DisbursedDate { get; set; }
    public LoanStatus Status { get; set; } = LoanStatus.Active;
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

