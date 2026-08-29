using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Definitions.DTOs;

namespace NextGenBytes.ERP.Application.Definitions.Interfaces;

public interface IDepartmentService
{
    Task<ApiResponse<PagedResponse<DepartmentResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<DepartmentResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<DepartmentResponse>> CreateAsync(CreateDepartmentRequest request, string createdBy);
    Task<ApiResponse<DepartmentResponse>> UpdateAsync(Guid id, UpdateDepartmentRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
    Task<ApiResponse<NextCodeResponse>> GetNextCodeAsync();
}
