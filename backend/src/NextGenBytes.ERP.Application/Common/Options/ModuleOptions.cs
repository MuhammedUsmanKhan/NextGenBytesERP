namespace NextGenBytes.ERP.Application.Common.Options;

public sealed class ModuleOptions
{
    public const string SectionName = "Modules";

    public bool Payroll { get; set; } = true;
    public bool Definitions { get; set; } = true;
    public bool Inventory { get; set; } = false;
    public bool SalesOrders { get; set; } = false;
    public bool Purchases { get; set; } = false;
    public bool AuditLogs { get; set; } = true;
    public bool Administration { get; set; } = true;

    public bool IsEnabled(string moduleName) => moduleName.ToLowerInvariant() switch
    {
        "payroll" => Payroll,
        "definitions" => Definitions,
        "inventory" => Inventory,
        "salesorders" or "sales" => SalesOrders,
        "purchases" => Purchases,
        "auditlogs" => AuditLogs,
        "administration" or "admin" => Administration,
        _ => false
    };
}

