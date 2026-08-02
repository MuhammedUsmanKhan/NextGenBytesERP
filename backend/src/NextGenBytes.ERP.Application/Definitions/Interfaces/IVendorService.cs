using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Definitions.DTOs;

namespace NextGenBytes.ERP.Application.Definitions.Interfaces;

public interface IVendorService
{
    Task<ApiResponse<PagedResponse<VendorResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<VendorResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<VendorResponse>> CreateAsync(CreateVendorRequest request, string createdBy);
    Task<ApiResponse<VendorResponse>> UpdateAsync(Guid id, UpdateVendorRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<NextVendorCodeResponse>> GetNextVendorCodeAsync();
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
}
