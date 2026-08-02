using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Definitions.DTOs;

namespace NextGenBytes.ERP.Application.Definitions.Interfaces;

public interface IProductGroupService
{
    Task<ApiResponse<PagedResponse<ProductGroupResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<ProductGroupResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<ProductGroupResponse>> CreateAsync(CreateProductGroupRequest request, string createdBy);
    Task<ApiResponse<ProductGroupResponse>> UpdateAsync(Guid id, UpdateProductGroupRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
    Task<ApiResponse<NextCodeResponse>> GetNextCodeAsync();
}
