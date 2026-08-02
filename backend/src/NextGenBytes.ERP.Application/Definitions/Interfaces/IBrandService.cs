using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Definitions.DTOs;

namespace NextGenBytes.ERP.Application.Definitions.Interfaces;

public interface IBrandService
{
    Task<ApiResponse<PagedResponse<BrandResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<BrandResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<BrandResponse>> CreateAsync(CreateBrandRequest request, string createdBy);
    Task<ApiResponse<BrandResponse>> UpdateAsync(Guid id, UpdateBrandRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
    Task<ApiResponse<NextCodeResponse>> GetNextCodeAsync();
}
