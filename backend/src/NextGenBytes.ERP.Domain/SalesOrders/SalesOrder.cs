using NextGenBytes.ERP.Domain.Definitions;

namespace NextGenBytes.ERP.Domain.SalesOrders;

public sealed class SalesOrder
{
    public Guid Id { get; set; }
    public string SalesOrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }

    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public string? CustomerPurchaseOrderNumber { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }

    public Guid? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public string? CycleShot { get; set; }
    public string Status { get; set; } = "Open";
    public string? Remarks { get; set; }

    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal GrandTotal { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    public ICollection<SalesOrderItem> Items { get; set; } = [];
}
