using SupplyChainManagement.Application.Common;
using SupplyChainManagement.Application.Definitions.DTOs;

namespace SupplyChainManagement.Application.Definitions.Interfaces;

public interface IUnitService
{
    Task<ApiResponse<PagedResponse<UnitResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status);
    Task<ApiResponse<UnitResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<UnitResponse>> CreateAsync(CreateUnitRequest request, string createdBy);
    Task<ApiResponse<UnitResponse>> UpdateAsync(Guid id, UpdateUnitRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateStatusAsync(Guid id, UpdateStatusRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
}
