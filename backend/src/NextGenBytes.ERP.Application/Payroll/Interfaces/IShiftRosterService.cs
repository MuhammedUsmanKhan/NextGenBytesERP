using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;

namespace NextGenBytes.ERP.Application.Payroll.Interfaces;

public interface IShiftRosterService
{
    Task<ApiResponse<ShiftRosterCalendarResponse>> GetRosterCalendarAsync(
        string monthYear,
        Guid? departmentId = null,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<int>> BulkAssignRosterAsync(
        BulkAssignRosterRequest request,
        string userId,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<bool>> DeleteRosterAssignmentAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}
