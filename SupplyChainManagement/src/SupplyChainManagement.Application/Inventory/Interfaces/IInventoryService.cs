using SupplyChainManagement.Application.Common;
using SupplyChainManagement.Application.Inventory.DTOs;

namespace SupplyChainManagement.Application.Inventory.Interfaces;

public interface IInventoryService
{
    Task<ApiResponse<PagedResponse<InventoryResponse>>> GetAllInventoryAsync(
        int page, int pageSize, Guid? warehouseId, Guid? productId, bool? belowReorder);
    Task<ApiResponse<InventoryResponse>> GetInventoryAsync(Guid productId, Guid warehouseId);
    Task<ApiResponse<InventoryResponse>> CreateOpeningStockAsync(OpeningStockRequest request, string createdBy);
    Task<ApiResponse<PagedResponse<InventoryTransactionResponse>>> GetTransactionsAsync(
        int page, int pageSize, Guid? productId, Guid? warehouseId, string? type, DateTime? dateFrom, DateTime? dateTo);
    Task<ApiResponse<InventoryTransactionResponse>> GetTransactionByIdAsync(Guid id);
}
