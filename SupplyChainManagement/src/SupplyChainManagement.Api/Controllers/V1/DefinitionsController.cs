using Microsoft.AspNetCore.Mvc;
using SupplyChainManagement.Api.Authorization;
using SupplyChainManagement.Application.Common;
using SupplyChainManagement.Application.Definitions.DTOs;
using SupplyChainManagement.Application.Definitions.Interfaces;

namespace SupplyChainManagement.Api.Controllers.V1;

[ApiController]
[Route("api/v1/definitions")]
public sealed class DefinitionsController : ControllerBase
{
    private readonly IDefinitionsService _definitionsService;

    public DefinitionsController(IDefinitionsService definitionsService)
    {
        _definitionsService = definitionsService;
    }

    private string CurrentUser => User.Identity?.Name ?? "system";

    // ── Main Categories ─────────────────────────────────────

    [HttpGet("main-categories")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("List main categories (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMainCategories(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _definitionsService.GetAllMainCategoriesAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("main-categories/{id:guid}")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Get main category by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMainCategory(Guid id)
    {
        var result = await _definitionsService.GetMainCategoryByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpGet("main-categories/lookup")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("List active main categories for lookup")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMainCategoryLookup()
    {
        var result = await _definitionsService.GetMainCategoryLookupAsync();
        return Ok(result);
    }

    [HttpPost("main-categories")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Create a main category")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateMainCategory([FromBody] CreateMainCategoryRequest request)
    {
        var result = await _definitionsService.CreateMainCategoryAsync(request, CurrentUser);
        return Ok(result);
    }

    [HttpPut("main-categories/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update a main category")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMainCategory(Guid id, [FromBody] UpdateMainCategoryRequest request)
    {
        var result = await _definitionsService.UpdateMainCategoryAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPatch("main-categories/{id:guid}/status")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update main category status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMainCategoryStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var result = await _definitionsService.UpdateMainCategoryStatusAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("main-categories/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Soft delete a main category")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMainCategory(Guid id)
    {
        var result = await _definitionsService.DeleteMainCategoryAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    // ── Sub Categories ──────────────────────────────────────

    [HttpGet("sub-categories")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("List sub categories (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSubCategories(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _definitionsService.GetAllSubCategoriesAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("sub-categories/{id:guid}")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Get sub category by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSubCategory(Guid id)
    {
        var result = await _definitionsService.GetSubCategoryByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost("sub-categories")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Create a sub category")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateSubCategory([FromBody] CreateSubCategoryRequest request)
    {
        var result = await _definitionsService.CreateSubCategoryAsync(request, CurrentUser);
        return Ok(result);
    }

    [HttpPut("sub-categories/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update a sub category")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSubCategory(Guid id, [FromBody] UpdateSubCategoryRequest request)
    {
        var result = await _definitionsService.UpdateSubCategoryAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPatch("sub-categories/{id:guid}/status")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update sub category status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSubCategoryStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var result = await _definitionsService.UpdateSubCategoryStatusAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("sub-categories/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Soft delete a sub category")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSubCategory(Guid id)
    {
        var result = await _definitionsService.DeleteSubCategoryAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    // ── Brands ───────────────────────────────────────────────

    [HttpGet("brands")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("List brands (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetBrands(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _definitionsService.GetAllBrandsAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("brands/{id:guid}")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Get brand by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetBrand(Guid id)
    {
        var result = await _definitionsService.GetBrandByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost("brands")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Create a brand")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateBrand([FromBody] CreateBrandRequest request)
    {
        var result = await _definitionsService.CreateBrandAsync(request, CurrentUser);
        return Ok(result);
    }

    [HttpPut("brands/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update a brand")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBrand(Guid id, [FromBody] UpdateBrandRequest request)
    {
        var result = await _definitionsService.UpdateBrandAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPatch("brands/{id:guid}/status")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update brand status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBrandStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var result = await _definitionsService.UpdateBrandStatusAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("brands/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Soft delete a brand")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBrand(Guid id)
    {
        var result = await _definitionsService.DeleteBrandAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    // ── Warehouses ───────────────────────────────────────────

    [HttpGet("warehouses")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("List warehouses (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetWarehouses(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _definitionsService.GetAllWarehousesAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("warehouses/{id:guid}")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Get warehouse by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetWarehouse(Guid id)
    {
        var result = await _definitionsService.GetWarehouseByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost("warehouses")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Create a warehouse")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateWarehouse([FromBody] CreateWarehouseRequest request)
    {
        var result = await _definitionsService.CreateWarehouseAsync(request, CurrentUser);
        return Ok(result);
    }

    [HttpPut("warehouses/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update a warehouse")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateWarehouse(Guid id, [FromBody] UpdateWarehouseRequest request)
    {
        var result = await _definitionsService.UpdateWarehouseAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPatch("warehouses/{id:guid}/status")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update warehouse status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateWarehouseStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var result = await _definitionsService.UpdateWarehouseStatusAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("warehouses/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Soft delete a warehouse")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteWarehouse(Guid id)
    {
        var result = await _definitionsService.DeleteWarehouseAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    // ── Product Groups ───────────────────────────────────────

    [HttpGet("product-groups")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("List product groups (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProductGroups(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _definitionsService.GetAllProductGroupsAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("product-groups/{id:guid}")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Get product group by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProductGroup(Guid id)
    {
        var result = await _definitionsService.GetProductGroupByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost("product-groups")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Create a product group")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateProductGroup([FromBody] CreateProductGroupRequest request)
    {
        var result = await _definitionsService.CreateProductGroupAsync(request, CurrentUser);
        return Ok(result);
    }

    [HttpPut("product-groups/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update a product group")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProductGroup(Guid id, [FromBody] UpdateProductGroupRequest request)
    {
        var result = await _definitionsService.UpdateProductGroupAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPatch("product-groups/{id:guid}/status")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update product group status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProductGroupStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var result = await _definitionsService.UpdateProductGroupStatusAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("product-groups/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Soft delete a product group")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProductGroup(Guid id)
    {
        var result = await _definitionsService.DeleteProductGroupAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    // ── Transporters ─────────────────────────────────────────

    [HttpGet("transporters")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("List transporters (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetTransporters(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _definitionsService.GetAllTransportersAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("transporters/{id:guid}")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Get transporter by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetTransporter(Guid id)
    {
        var result = await _definitionsService.GetTransporterByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost("transporters")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Create a transporter")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateTransporter([FromBody] CreateTransporterRequest request)
    {
        var result = await _definitionsService.CreateTransporterAsync(request, CurrentUser);
        return Ok(result);
    }

    [HttpPut("transporters/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update a transporter")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTransporter(Guid id, [FromBody] UpdateTransporterRequest request)
    {
        var result = await _definitionsService.UpdateTransporterAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPatch("transporters/{id:guid}/status")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update transporter status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTransporterStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var result = await _definitionsService.UpdateTransporterStatusAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("transporters/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Soft delete a transporter")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTransporter(Guid id)
    {
        var result = await _definitionsService.DeleteTransporterAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }
}
