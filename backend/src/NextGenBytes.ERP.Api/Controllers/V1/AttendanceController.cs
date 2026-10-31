using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NextGenBytes.ERP.Api.Authorization;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Interfaces;

namespace NextGenBytes.ERP.Api.Controllers.V1;

[ApiController]
[Route("api/v1/attendance")]
[Authorize]
[ModuleGate("Payroll")]
public sealed class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AttendanceController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    private string CurrentUser => User.Identity?.Name ?? "system";

    [HttpGet]
    [EndpointSummary("Get attendance summary for a given month and category")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMonthAttendance(
        [FromQuery] string monthYear,
        [FromQuery] string? category = null,
        [FromQuery] Guid? departmentId = null,
        [FromQuery] string? search = null)
    {
        var result = await _attendanceService.GetMonthAttendanceAsync(monthYear, category, departmentId, search);
        return Ok(result);
    }

    [HttpPost]
    [EndpointSummary("Upsert individual employee attendance record")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Upsert([FromBody] UpsertAttendanceRequest request)
    {
        var result = await _attendanceService.UpsertAsync(request, CurrentUser);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("bulk")]
    [EndpointSummary("Bulk upsert attendance records for a month")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> BulkUpsert([FromBody] BulkUpsertAttendanceRequest request)
    {
        var result = await _attendanceService.BulkUpsertAsync(request, CurrentUser);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}
