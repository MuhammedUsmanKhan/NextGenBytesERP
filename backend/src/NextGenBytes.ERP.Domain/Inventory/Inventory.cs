using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Domain.Products;

namespace NextGenBytes.ERP.Domain.Inventory;

public sealed class Inventory
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public decimal QuantityOnHand { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal AverageCost { get; set; }
    public decimal? MinStock { get; set; }
    public decimal? MaxStock { get; set; }
    public decimal? ReorderLevel { get; set; }
    public decimal AvailableQuantity { get; private set; }
    public DateTime UpdatedAt { get; set; }
}
