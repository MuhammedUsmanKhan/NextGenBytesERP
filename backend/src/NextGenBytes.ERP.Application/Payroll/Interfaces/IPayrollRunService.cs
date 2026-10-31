using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;

namespace NextGenBytes.ERP.Application.Payroll.Interfaces;

public interface IPayrollRunService
{
    Task<ApiResponse<PagedResponse<PayrollRunResponse>>> GetRunsAsync(
        string? monthYear = null,
        int page = 1,
        int pageSize = 20);

    Task<ApiResponse<PayrollRunDetailResponse>> GetRunByIdAsync(Guid id);

    Task<ApiResponse<PayrollRunDetailResponse>> CreateOrRecalculateRunAsync(
        CreatePayrollRunRequest request,
        string userId);

    Task<ApiResponse<PayrollRunResponse>> ApproveRunAsync(Guid id, string userId, bool allowOverride = false);

    Task<ApiResponse<bool>> DeleteRunAsync(Guid id, string userId);
}

