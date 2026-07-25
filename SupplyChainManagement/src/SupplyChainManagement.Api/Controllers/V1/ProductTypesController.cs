using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupplyChainManagement.Application.Common;
using SupplyChainManagement.Application.Definitions.DTOs;
using SupplyChainManagement.Application.Definitions.Interfaces;

namespace SupplyChainManagement.Api.Controllers.V1;

[ApiController]
[Route("api/v1/product-types")]
[Authorize]
public sealed class ProductTypesController : ControllerBase
{
    private readonly IProductTypeService _productTypeService;

    public ProductTypesController(IProductTypeService productTypeService)
    {
        _productTypeService = productTypeService;
    }

    private string CurrentUser => User.Identity?.Name ?? "system";

    [HttpGet]
    [EndpointSummary("List product types (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _productTypeService.GetAllAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [EndpointSummary("Get product type by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _productTypeService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [EndpointSummary("Create a product type")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateProductTypeRequest request)
    {
        var result = await _productTypeService.CreateAsync(request, CurrentUser);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [EndpointSummary("Update a product type")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductTypeRequest request)
    {
        var result = await _productTypeService.UpdateAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/status")]
    [EndpointSummary("Update product type status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var result = await _productTypeService.UpdateStatusAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [EndpointSummary("Soft delete a product type")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _productTypeService.DeleteAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }
}
