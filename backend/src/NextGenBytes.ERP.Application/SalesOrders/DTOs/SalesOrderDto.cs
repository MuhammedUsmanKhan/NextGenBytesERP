using System.ComponentModel.DataAnnotations;

namespace NextGenBytes.ERP.Application.SalesOrders.DTOs;

public sealed record SalesOrderItemResponse(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? Description,
    decimal Quantity,
    decimal UnitPrice,
    decimal LineAmount);

public sealed record SalesOrderResponse(
    Guid Id,
    string SalesOrderNumber,
    DateTime OrderDate,
    Guid CustomerId,
    string CustomerName,
    string? CustomerPurchaseOrderNumber,
    DateTime? ExpectedDeliveryDate,
    Guid? WarehouseId,
    string? WarehouseName,
    Guid? DepartmentId,
    string? DepartmentName,
    string? CycleShot,
    string Status,
    string? Remarks,
    decimal SubTotal,
    decimal DiscountAmount,
    decimal TaxAmount,
    decimal GrandTotal,
    List<SalesOrderItemResponse> Items,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public sealed record CreateSalesOrderItemRequest(
    [Required] Guid ProductId,
    [MaxLength(500)] string? Description,
    [Required] decimal Quantity,
    [Required] decimal UnitPrice);

public sealed record CreateSalesOrderRequest(
    [Required] DateTime OrderDate,
    [Required] Guid CustomerId,
    [MaxLength(100)] string? CustomerPurchaseOrderNumber,
    DateTime? ExpectedDeliveryDate,
    Guid? WarehouseId,
    Guid? DepartmentId,
    [MaxLength(256)] string? CycleShot,
    [MaxLength(1000)] string? Remarks,
    decimal DiscountAmount,
    decimal TaxAmount,
    [Required] List<CreateSalesOrderItemRequest> Items);

public sealed record UpdateSalesOrderItemRequest(
    Guid? Id,
    [Required] Guid ProductId,
    [MaxLength(500)] string? Description,
    [Required] decimal Quantity,
    [Required] decimal UnitPrice);

public sealed record UpdateSalesOrderRequest(
    [Required] DateTime OrderDate,
    [Required] Guid CustomerId,
    [MaxLength(100)] string? CustomerPurchaseOrderNumber,
    DateTime? ExpectedDeliveryDate,
    Guid? WarehouseId,
    Guid? DepartmentId,
    [MaxLength(256)] string? CycleShot,
    [MaxLength(1000)] string? Remarks,
    decimal DiscountAmount,
    decimal TaxAmount,
    [Required] List<UpdateSalesOrderItemRequest> Items);

public static class SalesOrderMappings
{
    public static SalesOrderItemResponse ToItemResponse(this Domain.SalesOrders.SalesOrderItem entity) => new(
        entity.Id,
        entity.ProductId,
        entity.Product?.Name ?? string.Empty,
        entity.Description,
        entity.Quantity,
        entity.UnitPrice,
        entity.LineAmount);

    public static SalesOrderResponse ToResponse(this Domain.SalesOrders.SalesOrder entity) => new(
        entity.Id,
        entity.SalesOrderNumber,
        entity.OrderDate,
        entity.CustomerId,
        entity.Customer?.CompanyName ?? string.Empty,
        entity.CustomerPurchaseOrderNumber,
        entity.ExpectedDeliveryDate,
        entity.WarehouseId,
        entity.Warehouse?.Name,
        entity.DepartmentId,
        entity.Department?.Name,
        entity.CycleShot,
        entity.Status,
        entity.Remarks,
        entity.SubTotal,
        entity.DiscountAmount,
        entity.TaxAmount,
        entity.GrandTotal,
        entity.Items.Select(i => i.ToItemResponse()).ToList(),
        entity.CreatedAt,
        entity.CreatedBy,
        entity.UpdatedAt,
        entity.UpdatedBy);
}
