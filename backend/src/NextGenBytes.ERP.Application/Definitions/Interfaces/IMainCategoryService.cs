using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Definitions.DTOs;

namespace NextGenBytes.ERP.Application.Definitions.Interfaces;

public interface IMainCategoryService
{
    Task<ApiResponse<PagedResponse<MainCategoryResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<MainCategoryResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<MainCategoryResponse>> CreateAsync(CreateMainCategoryRequest request, string createdBy);
    Task<ApiResponse<MainCategoryResponse>> UpdateAsync(Guid id, UpdateMainCategoryRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
    Task<ApiResponse<List<MainCategoryLookupDto>>> GetLookupAsync();
    Task<ApiResponse<NextCodeResponse>> GetNextCodeAsync();
}
