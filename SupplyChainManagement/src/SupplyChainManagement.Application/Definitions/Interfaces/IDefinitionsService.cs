using SupplyChainManagement.Application.Common;
using SupplyChainManagement.Application.Definitions.DTOs;

namespace SupplyChainManagement.Application.Definitions.Interfaces;

public interface IDefinitionsService
{
    Task<ApiResponse<PagedResponse<MainCategoryResponse>>> GetAllMainCategoriesAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<MainCategoryResponse>> GetMainCategoryByIdAsync(Guid id);
    Task<ApiResponse<MainCategoryResponse>> CreateMainCategoryAsync(CreateMainCategoryRequest request, string createdBy);
    Task<ApiResponse<MainCategoryResponse>> UpdateMainCategoryAsync(Guid id, UpdateMainCategoryRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateMainCategoryStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteMainCategoryAsync(Guid id, string deletedBy);
    Task<ApiResponse<List<MainCategoryLookupDto>>> GetMainCategoryLookupAsync();

    Task<ApiResponse<PagedResponse<SubCategoryResponse>>> GetAllSubCategoriesAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<SubCategoryResponse>> GetSubCategoryByIdAsync(Guid id);
    Task<ApiResponse<SubCategoryResponse>> CreateSubCategoryAsync(CreateSubCategoryRequest request, string createdBy);
    Task<ApiResponse<SubCategoryResponse>> UpdateSubCategoryAsync(Guid id, UpdateSubCategoryRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateSubCategoryStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteSubCategoryAsync(Guid id, string deletedBy);

    Task<ApiResponse<PagedResponse<BrandResponse>>> GetAllBrandsAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<BrandResponse>> GetBrandByIdAsync(Guid id);
    Task<ApiResponse<BrandResponse>> CreateBrandAsync(CreateBrandRequest request, string createdBy);
    Task<ApiResponse<BrandResponse>> UpdateBrandAsync(Guid id, UpdateBrandRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateBrandStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteBrandAsync(Guid id, string deletedBy);

    Task<ApiResponse<PagedResponse<WarehouseResponse>>> GetAllWarehousesAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<WarehouseResponse>> GetWarehouseByIdAsync(Guid id);
    Task<ApiResponse<WarehouseResponse>> CreateWarehouseAsync(CreateWarehouseRequest request, string createdBy);
    Task<ApiResponse<WarehouseResponse>> UpdateWarehouseAsync(Guid id, UpdateWarehouseRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateWarehouseStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteWarehouseAsync(Guid id, string deletedBy);

    Task<ApiResponse<PagedResponse<ProductGroupResponse>>> GetAllProductGroupsAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<ProductGroupResponse>> GetProductGroupByIdAsync(Guid id);
    Task<ApiResponse<ProductGroupResponse>> CreateProductGroupAsync(CreateProductGroupRequest request, string createdBy);
    Task<ApiResponse<ProductGroupResponse>> UpdateProductGroupAsync(Guid id, UpdateProductGroupRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateProductGroupStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteProductGroupAsync(Guid id, string deletedBy);

    Task<ApiResponse<PagedResponse<TransporterResponse>>> GetAllTransportersAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<TransporterResponse>> GetTransporterByIdAsync(Guid id);
    Task<ApiResponse<TransporterResponse>> CreateTransporterAsync(CreateTransporterRequest request, string createdBy);
    Task<ApiResponse<TransporterResponse>> UpdateTransporterAsync(Guid id, UpdateTransporterRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateTransporterStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteTransporterAsync(Guid id, string deletedBy);
}
