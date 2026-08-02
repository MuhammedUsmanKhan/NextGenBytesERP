using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Definitions.DTOs;

namespace NextGenBytes.ERP.Application.Definitions.Interfaces;

public interface IWarehouseService
{
    Task<ApiResponse<PagedResponse<WarehouseResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<WarehouseResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<WarehouseResponse>> CreateAsync(CreateWarehouseRequest request, string createdBy);
    Task<ApiResponse<WarehouseResponse>> UpdateAsync(Guid id, UpdateWarehouseRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
    Task<ApiResponse<NextCodeResponse>> GetNextCodeAsync();
}
