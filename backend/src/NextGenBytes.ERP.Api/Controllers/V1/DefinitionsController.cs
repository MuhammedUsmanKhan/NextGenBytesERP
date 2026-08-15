using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NextGenBytes.ERP.Api.Authorization;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Definitions.DTOs;
using NextGenBytes.ERP.Application.Definitions.Interfaces;

namespace NextGenBytes.ERP.Api.Controllers.V1;

[ApiController]
[Route("api/v1/definitions")]
[Authorize]
public sealed class DefinitionsController : ControllerBase
{
    private readonly IMainCategoryService _mainCategoryService;
    private readonly ISubCategoryService _subCategoryService;
    private readonly IBrandService _brandService;
    private readonly IWarehouseService _warehouseService;
    private readonly IProductGroupService _productGroupService;
    private readonly ITransporterService _transporterService;
    private readonly IProductTypeService _productTypeService;
    private readonly IUnitService _unitService;
    private readonly IVendorService _vendorService;
    private readonly ICustomerService _customerService;

    public DefinitionsController(
        IMainCategoryService mainCategoryService,
        ISubCategoryService subCategoryService,
        IBrandService brandService,
        IWarehouseService warehouseService,
        IProductGroupService productGroupService,
        ITransporterService transporterService,
        IProductTypeService productTypeService,
        IUnitService unitService,
        IVendorService vendorService,
        ICustomerService customerService)
    {
        _mainCategoryService = mainCategoryService;
        _subCategoryService = subCategoryService;
        _brandService = brandService;
        _warehouseService = warehouseService;
        _productGroupService = productGroupService;
        _transporterService = transporterService;
        _productTypeService = productTypeService;
        _unitService = unitService;
        _vendorService = vendorService;
        _customerService = customerService;
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
        var result = await _mainCategoryService.GetAllAsync(page, pageSize, search, status);
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
        var result = await _mainCategoryService.GetByIdAsync(id);
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
        var result = await _mainCategoryService.GetLookupAsync();
        return Ok(result);
    }

    [HttpGet("main-categories/next-code")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Preview the next auto-generated main category code")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetNextMainCategoryCode()
    {
        var result = await _mainCategoryService.GetNextCodeAsync();
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
        var result = await _mainCategoryService.CreateAsync(request, CurrentUser);
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
        var result = await _mainCategoryService.UpdateAsync(id, request, CurrentUser);
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
        var result = await _mainCategoryService.UpdateStatusAsync(id, request, CurrentUser);
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
        var result = await _mainCategoryService.DeleteAsync(id, CurrentUser);
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
        [FromQuery] string? status = null,
        [FromQuery] Guid? mainCategoryId = null)
    {
        var result = await _subCategoryService.GetAllAsync(page, pageSize, search, status, mainCategoryId);
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
        var result = await _subCategoryService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpGet("sub-categories/next-code")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Preview the next auto-generated sub category code")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetNextSubCategoryCode()
    {
        var result = await _subCategoryService.GetNextCodeAsync();
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
        var result = await _subCategoryService.CreateAsync(request, CurrentUser);
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
        var result = await _subCategoryService.UpdateAsync(id, request, CurrentUser);
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
        var result = await _subCategoryService.UpdateStatusAsync(id, request, CurrentUser);
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
        var result = await _subCategoryService.DeleteAsync(id, CurrentUser);
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
        var result = await _brandService.GetAllAsync(page, pageSize, search, status);
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
        var result = await _brandService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpGet("brands/next-code")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Preview the next auto-generated brand code")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetNextBrandCode()
    {
        var result = await _brandService.GetNextCodeAsync();
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
        var result = await _brandService.CreateAsync(request, CurrentUser);
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
        var result = await _brandService.UpdateAsync(id, request, CurrentUser);
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
        var result = await _brandService.UpdateStatusAsync(id, request, CurrentUser);
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
        var result = await _brandService.DeleteAsync(id, CurrentUser);
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
        var result = await _warehouseService.GetAllAsync(page, pageSize, search, status);
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
        var result = await _warehouseService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpGet("warehouses/next-code")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Preview the next auto-generated warehouse code")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetNextWarehouseCode()
    {
        var result = await _warehouseService.GetNextCodeAsync();
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
        var result = await _warehouseService.CreateAsync(request, CurrentUser);
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
        var result = await _warehouseService.UpdateAsync(id, request, CurrentUser);
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
        var result = await _warehouseService.UpdateStatusAsync(id, request, CurrentUser);
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
        var result = await _warehouseService.DeleteAsync(id, CurrentUser);
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
        var result = await _productGroupService.GetAllAsync(page, pageSize, search, status);
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
        var result = await _productGroupService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpGet("product-groups/next-code")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Preview the next auto-generated product group code")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetNextProductGroupCode()
    {
        var result = await _productGroupService.GetNextCodeAsync();
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
        var result = await _productGroupService.CreateAsync(request, CurrentUser);
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
        var result = await _productGroupService.UpdateAsync(id, request, CurrentUser);
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
        var result = await _productGroupService.UpdateStatusAsync(id, request, CurrentUser);
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
        var result = await _productGroupService.DeleteAsync(id, CurrentUser);
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
        var result = await _transporterService.GetAllAsync(page, pageSize, search, status);
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
        var result = await _transporterService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpGet("transporters/next-code")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Preview the next auto-generated transporter code")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetNextTransporterCode()
    {
        var result = await _transporterService.GetNextCodeAsync();
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
        var result = await _transporterService.CreateAsync(request, CurrentUser);
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
        var result = await _transporterService.UpdateAsync(id, request, CurrentUser);
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
        var result = await _transporterService.UpdateStatusAsync(id, request, CurrentUser);
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
        var result = await _transporterService.DeleteAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    // ── Product Types ─────────────────────────────────────────

    [HttpGet("product-types")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("List product types (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProductTypes(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _productTypeService.GetAllAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("product-types/{id:guid}")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Get product type by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProductType(Guid id)
    {
        var result = await _productTypeService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost("product-types")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Create a product type")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateProductType([FromBody] CreateProductTypeRequest request)
    {
        var result = await _productTypeService.CreateAsync(request, CurrentUser);
        return Ok(result);
    }

    [HttpPut("product-types/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update a product type")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProductType(Guid id, [FromBody] UpdateProductTypeRequest request)
    {
        var result = await _productTypeService.UpdateAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPatch("product-types/{id:guid}/status")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update product type status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProductTypeStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var result = await _productTypeService.UpdateStatusAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("product-types/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Soft delete a product type")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProductType(Guid id)
    {
        var result = await _productTypeService.DeleteAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    // ── Units ─────────────────────────────────────────────────

    [HttpGet("units")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("List units (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUnits(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _unitService.GetAllAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("units/{id:guid}")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Get unit by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUnit(Guid id)
    {
        var result = await _unitService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost("units")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Create a unit")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateUnit([FromBody] CreateUnitRequest request)
    {
        var result = await _unitService.CreateAsync(request, CurrentUser);
        return Ok(result);
    }

    [HttpPut("units/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update a unit")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUnit(Guid id, [FromBody] UpdateUnitRequest request)
    {
        var result = await _unitService.UpdateAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPatch("units/{id:guid}/status")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update unit status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUnitStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var result = await _unitService.UpdateStatusAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("units/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Soft delete a unit")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUnit(Guid id)
    {
        var result = await _unitService.DeleteAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    // ── Vendors ─────────────────────────────────────────────

    [HttpGet("vendors")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("List vendors (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetVendors(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _vendorService.GetAllAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("vendors/{id:guid}")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Get vendor by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetVendor(Guid id)
    {
        var result = await _vendorService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpGet("vendors/next-code")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Preview the next auto-generated vendor code")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetNextVendorCode()
    {
        var result = await _vendorService.GetNextVendorCodeAsync();
        return Ok(result);
    }

    [HttpPost("vendors")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Create a vendor (VendorCode auto-generated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateVendor([FromBody] CreateVendorRequest request)
    {
        var result = await _vendorService.CreateAsync(request, CurrentUser);
        return Ok(result);
    }

    [HttpPut("vendors/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update a vendor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateVendor(Guid id, [FromBody] UpdateVendorRequest request)
    {
        var result = await _vendorService.UpdateAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPatch("vendors/{id:guid}/status")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update vendor status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateVendorStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var result = await _vendorService.UpdateStatusAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("vendors/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Soft delete a vendor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteVendor(Guid id)
    {
        var result = await _vendorService.DeleteAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    // ── Customers ────────────────────────────────────────────

    [HttpGet("customers")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("List customers (paginated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _customerService.GetAllAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("customers/{id:guid}")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Get customer by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetCustomer(Guid id)
    {
        var result = await _customerService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpGet("customers/next-code")]
    [RequirePermission("Definitions.View")]
    [EndpointSummary("Preview the next auto-generated customer code")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetNextCustomerCode()
    {
        var result = await _customerService.GetNextCustomerCodeAsync();
        return Ok(result);
    }

    [HttpPost("customers")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Create a customer (CustomerCode auto-generated)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        var result = await _customerService.CreateAsync(request, CurrentUser);
        return Ok(result);
    }

    [HttpPut("customers/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update a customer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCustomer(Guid id, [FromBody] UpdateCustomerRequest request)
    {
        var result = await _customerService.UpdateAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPatch("customers/{id:guid}/status")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Update customer status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCustomerStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var result = await _customerService.UpdateStatusAsync(id, request, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("customers/{id:guid}")]
    [RequirePermission("Definitions.Edit")]
    [EndpointSummary("Soft delete a customer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        var result = await _customerService.DeleteAsync(id, CurrentUser);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }
}
