using SupplyChainManagement.Application.Common;
using SupplyChainManagement.Application.Definitions.DTOs;

namespace SupplyChainManagement.Application.Definitions.Interfaces;

public interface IProductTypeService
{
    Task<ApiResponse<PagedResponse<ProductTypeResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<ProductTypeResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<ProductTypeResponse>> CreateAsync(CreateProductTypeRequest request, string createdBy);
    Task<ApiResponse<ProductTypeResponse>> UpdateAsync(Guid id, UpdateProductTypeRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
}
