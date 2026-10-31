using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Domain.Payroll;

public sealed class ShiftDefinition
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    
    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public TimeOnly ShiftStart { get; set; } = new(8, 0);
    public TimeOnly ShiftEnd { get; set; } = new(17, 0);
    public int ShiftDurationMinutes { get; set; } = 540; // 9 hours default

    public int GraceLateMinutes { get; set; } = 10;
    public GraceDeductionMode GraceMode { get; set; } = GraceDeductionMode.DeductAllFromStart;

    public bool IsOvernightShift { get; set; } = false;
    public TimeOnly NightShiftStart { get; set; } = new(18, 0);
    public TimeOnly NightShiftEnd { get; set; } = new(6, 0);

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    public ICollection<Employee> Employees { get; set; } = [];
}

