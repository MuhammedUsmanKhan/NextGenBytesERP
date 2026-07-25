using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupplyChainManagement.Application.Common;
using SupplyChainManagement.Application.Definitions.DTOs;
using SupplyChainManagement.Application.Definitions.Interfaces;

namespace SupplyChainManagement.Api.Controllers.V1;

[ApiController]
[Route("api/v1/units")]
[Authorize]
public sealed class UnitsController : ControllerBase
{
    private readonly IUnitService _unitService;

    public UnitsController(IUnitService unitService)
    {
        _unitService = unitService;
    }

    private string CurrentUser => User.Identity?.Name ?? "system";

    [HttpGet]
    [EndpointSummary("List units (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _unitService.GetAllAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [EndpointSummary("Get unit by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _unitService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [EndpointSummary("Create a unit")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateUnitRequest request)
    {
        var result = await _unitService.CreateAsync(request, CurrentUser);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [EndpointSummary("Update a unit")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUnitRequest request)
    {
        var result = await _unitService.UpdateAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/status")]
    [EndpointSummary("Update unit status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var result = await _unitService.UpdateStatusAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [EndpointSummary("Soft delete a unit")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _unitService.DeleteAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }
}
