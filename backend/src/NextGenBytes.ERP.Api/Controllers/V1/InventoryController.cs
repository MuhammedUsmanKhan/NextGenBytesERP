using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NextGenBytes.ERP.Application.Inventory.DTOs;
using NextGenBytes.ERP.Application.Inventory.Interfaces;

namespace NextGenBytes.ERP.Api.Controllers.V1;

[ApiController]
[Route("api/v1/inventory")]
[Authorize]
public sealed class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    private string CurrentUser => User.Identity?.Name ?? "system";

    [HttpGet]
    [EndpointSummary("List inventory (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? warehouseId = null,
        [FromQuery] Guid? productId = null,
        [FromQuery] bool? belowReorder = null)
    {
        var result = await _inventoryService.GetAllInventoryAsync(page, pageSize, warehouseId, productId, belowReorder);
        return Ok(result);
    }

    [HttpGet("{productId:guid}/{warehouseId:guid}")]
    [EndpointSummary("Get inventory by product and warehouse")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetById(Guid productId, Guid warehouseId)
    {
        var result = await _inventoryService.GetInventoryAsync(productId, warehouseId);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost("opening-stock")]
    [EndpointSummary("Create opening stock entry")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateOpeningStock([FromBody] OpeningStockRequest request)
    {
        var result = await _inventoryService.CreateOpeningStockAsync(request, CurrentUser);
        return Ok(result);
    }

    [HttpGet("transactions")]
    [EndpointSummary("List inventory transactions (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetTransactions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? productId = null,
        [FromQuery] Guid? warehouseId = null,
        [FromQuery] string? type = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null)
    {
        var result = await _inventoryService.GetTransactionsAsync(page, pageSize, productId, warehouseId, type, dateFrom, dateTo);
        return Ok(result);
    }

    [HttpGet("transactions/{id:guid}")]
    [EndpointSummary("Get inventory transaction by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetTransactionById(Guid id)
    {
        var result = await _inventoryService.GetTransactionByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }
}
