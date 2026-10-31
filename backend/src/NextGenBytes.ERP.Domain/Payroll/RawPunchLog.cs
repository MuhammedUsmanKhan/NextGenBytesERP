namespace NextGenBytes.ERP.Domain.Payroll;

public sealed class RawPunchLog
{
    public Guid Id { get; set; }
    public string BiometricDeviceId { get; set; } = string.Empty;
    
    public Guid? EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public DateTime PunchTimestamp { get; set; }
    public int TerminalId { get; set; } = 1;
    public int PunchState { get; set; } // 0=In, 1=Out, 4=OT-In
    public int WorkCode { get; set; } = 0;

    public string ImportBatchId { get; set; } = string.Empty;
    public bool IsDuplicateFiltered { get; set; } = false;

    public DateTime CreatedAt { get; set; }
}

