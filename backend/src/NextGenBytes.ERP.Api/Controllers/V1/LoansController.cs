using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NextGenBytes.ERP.Api.Authorization;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Interfaces;
using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Api.Controllers.V1;

[ApiController]
[Route("api/v1/loans")]
[Authorize]
[ModuleGate("Payroll")]
public sealed class LoansController : ControllerBase
{
    private readonly ILoanService _loanService;

    public LoansController(ILoanService loanService)
    {
        _loanService = loanService;
    }

    private string CurrentUser => User.Identity?.Name ?? "system";

    [HttpGet]
    [EndpointSummary("List advances and loans (paginated with filters)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? employeeId = null,
        [FromQuery] LoanType? type = null,
        [FromQuery] LoanStatus? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _loanService.GetAllAsync(employeeId, type, status, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [EndpointSummary("Get loan/advance record by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _loanService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPost]
    [EndpointSummary("Disburse salary advance or term loan")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateLoanRequest request)
    {
        var result = await _loanService.CreateAsync(request, CurrentUser);
        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [EndpointSummary("Update loan terms, monthly deduction, or balance")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLoanRequest request)
    {
        var result = await _loanService.UpdateAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [EndpointSummary("Delete loan/advance record")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _loanService.DeleteAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpGet("employee/{employeeId:guid}")]
    [EndpointSummary("Get active loans and advances for a specific employee")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetActiveForEmployee(Guid employeeId)
    {
        var result = await _loanService.GetActiveLoansForEmployeeAsync(employeeId);
        return Ok(result);
    }
}

