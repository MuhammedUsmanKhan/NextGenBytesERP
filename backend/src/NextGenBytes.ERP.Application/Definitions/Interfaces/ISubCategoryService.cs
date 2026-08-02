using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Definitions.DTOs;

namespace NextGenBytes.ERP.Application.Definitions.Interfaces;

public interface ISubCategoryService
{
    Task<ApiResponse<PagedResponse<SubCategoryResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status, Guid? mainCategoryId);
    Task<ApiResponse<SubCategoryResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<SubCategoryResponse>> CreateAsync(CreateSubCategoryRequest request, string createdBy);
    Task<ApiResponse<SubCategoryResponse>> UpdateAsync(Guid id, UpdateSubCategoryRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
    Task<ApiResponse<NextCodeResponse>> GetNextCodeAsync();
}
