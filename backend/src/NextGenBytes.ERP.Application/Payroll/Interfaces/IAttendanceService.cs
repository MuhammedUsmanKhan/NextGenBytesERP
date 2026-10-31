using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;

namespace NextGenBytes.ERP.Application.Payroll.Interfaces;

public interface IAttendanceService
{
    Task<ApiResponse<List<AttendanceSummaryResponse>>> GetMonthAttendanceAsync(
        string monthYear,
        string? category = null,
        Guid? departmentId = null,
        string? search = null);

    Task<ApiResponse<AttendanceSummaryResponse>> UpsertAsync(
        UpsertAttendanceRequest request,
        string userId);

    Task<ApiResponse<int>> BulkUpsertAsync(
        BulkUpsertAttendanceRequest request,
        string userId);
}
