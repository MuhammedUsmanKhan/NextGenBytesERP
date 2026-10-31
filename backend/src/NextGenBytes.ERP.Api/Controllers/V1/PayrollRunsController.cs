using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NextGenBytes.ERP.Api.Authorization;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Interfaces;

namespace NextGenBytes.ERP.Api.Controllers.V1;

[ApiController]
[Route("api/v1/payroll-runs")]
[Authorize]
[ModuleGate("Payroll")]
public sealed class PayrollRunsController : ControllerBase
{
    private readonly IPayrollRunService _payrollRunService;

    public PayrollRunsController(IPayrollRunService payrollRunService)
    {
        _payrollRunService = payrollRunService;
    }

    private string CurrentUser => User.Identity?.Name ?? "system";

    [HttpGet]
    [EndpointSummary("List payroll runs (paginated with month/year filter)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetRuns(
        [FromQuery] string? monthYear = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _payrollRunService.GetRunsAsync(monthYear, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [EndpointSummary("Get payroll run detail with all payslips and denomination breakdown")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _payrollRunService.GetRunByIdAsync(id);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPost]
    [EndpointSummary("Execute or recalculate a payroll run for a month")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateOrRecalculate([FromBody] CreatePayrollRunRequest request)
    {
        var result = await _payrollRunService.CreateOrRecalculateRunAsync(request, CurrentUser);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("{id:guid}/approve")]
    [EndpointSummary("Approve and lock a payroll run (deducts loan balances, validates attendance exceptions)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Approve(Guid id, [FromQuery] bool allowOverride = false)
    {
        var result = await _payrollRunService.ApproveRunAsync(id, CurrentUser, allowOverride);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [EndpointSummary("Delete a draft payroll run")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _payrollRunService.DeleteRunAsync(id, CurrentUser);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}

