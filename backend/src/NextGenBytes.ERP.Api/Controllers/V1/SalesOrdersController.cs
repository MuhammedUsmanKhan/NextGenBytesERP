using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NextGenBytes.ERP.Api.Authorization;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.SalesOrders.DTOs;
using NextGenBytes.ERP.Application.SalesOrders.Interfaces;

namespace NextGenBytes.ERP.Api.Controllers.V1;

[ApiController]
[Route("api/v1/sales-orders")]
[Authorize]
[ModuleGate("SalesOrders")]
public sealed class SalesOrdersController : ControllerBase
{
    private readonly ISalesOrderService _salesOrderService;

    public SalesOrdersController(ISalesOrderService salesOrderService)
    {
        _salesOrderService = salesOrderService;
    }

    private string CurrentUser => User.Identity?.Name ?? "system";

    [HttpGet]
    [EndpointSummary("List sales orders (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _salesOrderService.GetAllAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [EndpointSummary("Get sales order by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _salesOrderService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [EndpointSummary("Create a sales order")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateSalesOrderRequest request)
    {
        var result = await _salesOrderService.CreateAsync(request, CurrentUser);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [EndpointSummary("Update a sales order (Open only)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSalesOrderRequest request)
    {
        var result = await _salesOrderService.UpdateAsync(id, request, CurrentUser);
        if (!result.Success)
        {
            if (result.Message?.Contains("not found") == true)
                return NotFound(result);
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPatch("{id:guid}/close")]
    [EndpointSummary("Close a sales order (Open only)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Close(Guid id)
    {
        var result = await _salesOrderService.CloseAsync(id, CurrentUser);
        if (!result.Success)
        {
            if (result.Message?.Contains("not found") == true)
                return NotFound(result);
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [EndpointSummary("Soft delete a sales order (Open only)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _salesOrderService.DeleteAsync(id, CurrentUser);
        if (!result.Success)
        {
            if (result.Message?.Contains("not found") == true)
                return NotFound(result);
            return BadRequest(result);
        }
        return Ok(result);
    }
}
