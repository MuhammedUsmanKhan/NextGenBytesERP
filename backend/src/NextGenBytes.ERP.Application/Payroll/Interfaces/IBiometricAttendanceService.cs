using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;

namespace NextGenBytes.ERP.Application.Payroll.Interfaces;

public interface IBiometricAttendanceService
{
    Task<ApiResponse<BiometricUploadResponse>> UploadAndProcessDatAsync(
        Stream fileStream,
        string fileName,
        string userId,
        CancellationToken ct = default);

    Task<ApiResponse<PagedResponse<DailyAttendanceResponse>>> GetDailyAttendancesAsync(
        DateOnly? startDate = null,
        DateOnly? endDate = null,
        Guid? departmentId = null,
        Guid? employeeId = null,
        bool? hasException = null,
        int page = 1,
        int pageSize = 50);

    Task<ApiResponse<List<AttendanceExceptionResponse>>> GetUnresolvedExceptionsAsync(
        string monthYear,
        Guid? departmentId = null);

    Task<ApiResponse<DailyAttendanceResponse>> ResolveExceptionAsync(
        Guid dailyAttendanceId,
        ResolveAttendanceExceptionRequest request,
        string userId);

    Task<ApiResponse<List<BulkResolvePreviewItem>>> GetBulkResolvePreviewAsync(
        string monthYear,
        Guid? departmentId = null,
        Guid? employeeId = null,
        CancellationToken ct = default);

    Task<ApiResponse<int>> BulkResolveExceptionsAsync(
        BulkResolveExceptionsRequest request,
        string userId,
        CancellationToken ct = default);

    Task<ApiResponse<int>> SyncToMonthlySummaryAsync(
        string monthYear,
        string userId);

    Task<ApiResponse<int>> RecalculateAttendanceAsync(
        string monthYear,
        Guid? employeeId = null,
        string? userId = null,
        CancellationToken ct = default);
}

