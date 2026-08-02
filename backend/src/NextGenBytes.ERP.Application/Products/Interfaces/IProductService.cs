using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Products.DTOs;

namespace NextGenBytes.ERP.Application.Products.Interfaces;

public interface IProductService
{
    Task<ApiResponse<PagedResponse<ProductResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status, Guid? productTypeId);
    Task<ApiResponse<ProductResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<ProductResponse>> CreateAsync(CreateProductRequest request, string createdBy);
    Task<ApiResponse<ProductResponse>> UpdateAsync(Guid id, UpdateProductRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<NextProductCodeResponse>> GetNextProductCodeAsync(Guid productTypeId);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
}
