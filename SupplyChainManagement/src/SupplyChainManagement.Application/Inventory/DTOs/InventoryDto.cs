using System.ComponentModel.DataAnnotations;

namespace SupplyChainManagement.Application.Inventory.DTOs;

public sealed record InventoryResponse(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string ProductCode,
    Guid WarehouseId,
    string WarehouseName,
    decimal QuantityOnHand,
    decimal ReservedQuantity,
    decimal AvailableQuantity,
    decimal AverageCost,
    decimal? MinStock,
    decimal? MaxStock,
    decimal? ReorderLevel,
    DateTime UpdatedAt);

public sealed record OpeningStockRequest(
    [Required] Guid ProductId,
    [Required] Guid WarehouseId,
    [Required] decimal Quantity,
    [Required] decimal AverageCost,
    [Required] DateTime TransactionDate,
    [MaxLength(500)] string? Remarks);

public sealed record InventoryTransactionResponse(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string ProductCode,
    Guid WarehouseId,
    string WarehouseName,
    string TransactionType,
    string? ReferenceType,
    Guid? ReferenceId,
    decimal Quantity,
    decimal UnitCost,
    DateTime TransactionDate,
    string? Remarks,
    string CreatedBy,
    DateTime CreatedAt);

public static class InventoryMappings
{
    public static InventoryResponse ToResponse(this Domain.Inventory.Inventory entity, string productName, string productCode, string warehouseName) => new(
        entity.Id,
        entity.ProductId,
        productName,
        productCode,
        entity.WarehouseId,
        warehouseName,
        entity.QuantityOnHand,
        entity.ReservedQuantity,
        entity.AvailableQuantity,
        entity.AverageCost,
        entity.MinStock,
        entity.MaxStock,
        entity.ReorderLevel,
        entity.UpdatedAt);

    public static InventoryTransactionResponse ToResponse(this Domain.Inventory.InventoryTransaction entity, string productName, string productCode, string warehouseName) => new(
        entity.Id,
        entity.ProductId,
        productName,
        productCode,
        entity.WarehouseId,
        warehouseName,
        entity.TransactionType,
        entity.ReferenceType,
        entity.ReferenceId,
        entity.Quantity,
        entity.UnitCost,
        entity.TransactionDate,
        entity.Remarks,
        entity.CreatedBy,
        entity.CreatedAt);
}
