using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Definitions.DTOs;

namespace NextGenBytes.ERP.Application.Definitions.Interfaces;

public interface ICustomerService
{
    Task<ApiResponse<PagedResponse<CustomerResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<CustomerResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<CustomerResponse>> CreateAsync(CreateCustomerRequest request, string createdBy);
    Task<ApiResponse<CustomerResponse>> UpdateAsync(Guid id, UpdateCustomerRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<NextCustomerCodeResponse>> GetNextCustomerCodeAsync();
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
}