using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NextGenBytes.ERP.Api.Authorization;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Interfaces;

namespace NextGenBytes.ERP.Api.Controllers.V1;

[ApiController]
[Route("api/v1/shifts/roster")]
[Authorize]
[ModuleGate("Payroll")]
public sealed class ShiftRosterController : ControllerBase
{
    private readonly IShiftRosterService _shiftRosterService;

    public ShiftRosterController(IShiftRosterService shiftRosterService)
    {
        _shiftRosterService = shiftRosterService;
    }

    private string CurrentUser => User.Identity?.Name ?? "system";

    [HttpGet]
    [EndpointSummary("Get duty roster calendar assignments for a given month")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetRosterCalendar(
        [FromQuery] string monthYear,
        [FromQuery] Guid? departmentId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _shiftRosterService.GetRosterCalendarAsync(monthYear, departmentId, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("bulk-assign")]
    [EndpointSummary("Bulk assign temporary shifts to workers across dates with custom multiplier")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> BulkAssign(
        [FromBody] BulkAssignRosterRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await _shiftRosterService.BulkAssignRosterAsync(request, CurrentUser, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [EndpointSummary("Remove temporary shift roster assignment")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteAssignment(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var result = await _shiftRosterService.DeleteRosterAssignmentAsync(id, cancellationToken);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }
}

