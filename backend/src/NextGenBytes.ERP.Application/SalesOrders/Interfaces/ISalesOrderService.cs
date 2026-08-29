using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.SalesOrders.DTOs;

namespace NextGenBytes.ERP.Application.SalesOrders.Interfaces;

public interface ISalesOrderService
{
    Task<ApiResponse<PagedResponse<SalesOrderResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<SalesOrderResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<SalesOrderResponse>> CreateAsync(CreateSalesOrderRequest request, string createdBy);
    Task<ApiResponse<SalesOrderResponse>> UpdateAsync(Guid id, UpdateSalesOrderRequest request, string updatedBy);
    Task<ApiResponse<SalesOrderResponse>> CloseAsync(Guid id, string updatedBy);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
}
