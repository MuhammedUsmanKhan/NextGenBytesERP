namespace NextGenBytes.ERP.Domain.Payroll;

public sealed class PayslipDenomination
{
    public Guid Id { get; set; }
    public Guid PayslipId { get; set; }
    public Payslip Payslip { get; set; } = null!;

    public int Note5000 { get; set; }
    public int Note1000 { get; set; }
    public int Note500 { get; set; }
    public int Note100 { get; set; }
    public int Note50 { get; set; }
    public int Note20 { get; set; }
    public int Note10 { get; set; }
    public int CoinsRemainder { get; set; }
}

