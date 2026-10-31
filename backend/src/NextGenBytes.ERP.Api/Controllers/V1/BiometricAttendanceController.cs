using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NextGenBytes.ERP.Api.Authorization;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Interfaces;

namespace NextGenBytes.ERP.Api.Controllers.V1;

[ApiController]
[Route("api/v1/attendance/biometric")]
[Authorize]
[ModuleGate("Payroll")]
public sealed class BiometricAttendanceController : ControllerBase
{
    private readonly IBiometricAttendanceService _biometricAttendanceService;

    public BiometricAttendanceController(IBiometricAttendanceService biometricAttendanceService)
    {
        _biometricAttendanceService = biometricAttendanceService;
    }

    private string CurrentUser => User.Identity?.Name ?? "system";

    [HttpPost("upload")]
    [EndpointSummary("Upload and parse biometric device log file (.dat / ATTLOG)")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Upload(IFormFile? file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(ApiResponse<BiometricUploadResponse>.Fail("No file was uploaded or the file is empty."));
        }

        await using var stream = file.OpenReadStream();
        var result = await _biometricAttendanceService.UploadAndProcessDatAsync(stream, file.FileName, CurrentUser, ct);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("daily")]
    [EndpointSummary("Get paginated daily attendance records with shift pairing and exception details")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetDaily(
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null,
        [FromQuery] Guid? departmentId = null,
        [FromQuery] Guid? employeeId = null,
        [FromQuery] bool? hasException = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await _biometricAttendanceService.GetDailyAttendancesAsync(
            startDate, endDate, departmentId, employeeId, hasException, page, pageSize);

        return Ok(result);
    }

    [HttpGet("exceptions")]
    [EndpointSummary("Get unresolved attendance exceptions (missing check-ins/check-outs) for a month")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetExceptions(
        [FromQuery] string monthYear,
        [FromQuery] Guid? departmentId = null)
    {
        if (string.IsNullOrWhiteSpace(monthYear))
        {
            return BadRequest(ApiResponse<List<AttendanceExceptionResponse>>.Fail("The 'monthYear' parameter is required (format: YYYY-MM)."));
        }

        var result = await _biometricAttendanceService.GetUnresolvedExceptionsAsync(monthYear.Trim(), departmentId);
        return Ok(result);
    }

    [HttpPost("exceptions/{id:guid}/resolve")]
    [EndpointSummary("Resolve an attendance exception by providing manual check-in/out times or marking exempt")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ResolveException(
        Guid id,
        [FromBody] ResolveAttendanceExceptionRequest request)
    {
        var result = await _biometricAttendanceService.ResolveExceptionAsync(id, request, CurrentUser);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("exceptions/bulk-preview")]
    [EndpointSummary("Preview bulk resolution of single punch exceptions with suggested shift end times")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetBulkResolvePreview(
        [FromQuery] string monthYear,
        [FromQuery] Guid? departmentId = null,
        [FromQuery] Guid? employeeId = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(monthYear))
        {
            return BadRequest(ApiResponse<List<BulkResolvePreviewItem>>.Fail("The 'monthYear' parameter is required (format: YYYY-MM)."));
        }

        var result = await _biometricAttendanceService.GetBulkResolvePreviewAsync(monthYear.Trim(), departmentId, employeeId, ct);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("exceptions/bulk-resolve")]
    [EndpointSummary("Bulk resolve multiple attendance exceptions with suggested or custom punch-out times")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> BulkResolveExceptions(
        [FromBody] BulkResolveExceptionsRequest request,
        CancellationToken ct = default)
    {
        var result = await _biometricAttendanceService.BulkResolveExceptionsAsync(request, CurrentUser, ct);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("sync-summary")]
    [EndpointSummary("Aggregate daily biometric attendances into monthly AttendanceSummary roster for payroll")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SyncSummary([FromQuery] string monthYear)
    {
        if (string.IsNullOrWhiteSpace(monthYear))
        {
            return BadRequest(ApiResponse<int>.Fail("The 'monthYear' parameter is required (format: YYYY-MM)."));
        }

        var result = await _biometricAttendanceService.SyncToMonthlySummaryAsync(monthYear.Trim(), CurrentUser);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("recalculate")]
    [EndpointSummary("Recalculate daily attendance and monthly summaries from biometric punches and rosters")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Recalculate(
        [FromQuery] string monthYear,
        [FromQuery] Guid? employeeId = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(monthYear))
        {
            return BadRequest(ApiResponse<int>.Fail("The 'monthYear' parameter is required (format: YYYY-MM)."));
        }

        var result = await _biometricAttendanceService.RecalculateAttendanceAsync(monthYear.Trim(), employeeId, CurrentUser, ct);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}

