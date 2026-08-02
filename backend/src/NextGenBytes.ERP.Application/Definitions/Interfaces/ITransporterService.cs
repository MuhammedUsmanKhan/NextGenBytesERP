using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Definitions.DTOs;

namespace NextGenBytes.ERP.Application.Definitions.Interfaces;

public interface ITransporterService
{
    Task<ApiResponse<PagedResponse<TransporterResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<TransporterResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<TransporterResponse>> CreateAsync(CreateTransporterRequest request, string createdBy);
    Task<ApiResponse<TransporterResponse>> UpdateAsync(Guid id, UpdateTransporterRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
    Task<ApiResponse<NextCodeResponse>> GetNextCodeAsync();
}
