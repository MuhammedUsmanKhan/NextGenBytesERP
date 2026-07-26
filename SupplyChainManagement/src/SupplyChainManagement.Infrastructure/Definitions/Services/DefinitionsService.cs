using Microsoft.EntityFrameworkCore;
using SupplyChainManagement.Application.Common;
using SupplyChainManagement.Application.Definitions.DTOs;
using SupplyChainManagement.Application.Definitions.Interfaces;
using SupplyChainManagement.Domain.Definitions;
using SupplyChainManagement.Infrastructure.Persistence;

namespace SupplyChainManagement.Infrastructure.Definitions.Services;

public sealed class DefinitionsService : IDefinitionsService
{
    private readonly AppDbContext _context;

    public DefinitionsService(AppDbContext context)
    {
        _context = context;
    }

    // ── Main Categories ──────────────────────────────────────

    public async Task<ApiResponse<PagedResponse<MainCategoryResponse>>> GetAllMainCategoriesAsync(
        int page, int pageSize, string? search, string? status)
    {
        var query = _context.MainCategories.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.Name.Contains(search) || x.Code.Contains(search));

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.Status == status);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.ToResponse())
            .ToListAsync();

        return ApiResponse<PagedResponse<MainCategoryResponse>>.Ok(
            new PagedResponse<MainCategoryResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<MainCategoryResponse>> GetMainCategoryByIdAsync(Guid id)
    {
        var entity = await _context.MainCategories
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<MainCategoryResponse>.Fail($"MainCategory with ID '{id}' not found.");

        return ApiResponse<MainCategoryResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<MainCategoryResponse>> CreateMainCategoryAsync(
        CreateMainCategoryRequest request, string createdBy)
    {
        var entity = new MainCategory
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            Status = request.Status,
            CreatedBy = createdBy
        };

        _context.MainCategories.Add(entity);
        await _context.SaveChangesAsync();

        return ApiResponse<MainCategoryResponse>.Ok(entity.ToResponse(), "MainCategory created successfully.");
    }

    public async Task<ApiResponse<MainCategoryResponse>> UpdateMainCategoryAsync(
        Guid id, UpdateMainCategoryRequest request, string updatedBy)
    {
        var entity = await _context.MainCategories.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<MainCategoryResponse>.Fail($"MainCategory with ID '{id}' not found.");

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<MainCategoryResponse>.Ok(entity.ToResponse(), "MainCategory updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateMainCategoryStatusAsync(
        Guid id, UpdateStatusRequest request, string updatedBy)
    {
        var entity = await _context.MainCategories.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"MainCategory with ID '{id}' not found.");

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "MainCategory status updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteMainCategoryAsync(Guid id, string deletedBy)
    {
        var entity = await _context.MainCategories.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"MainCategory with ID '{id}' not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "MainCategory deleted successfully.");
    }

    public async Task<ApiResponse<List<MainCategoryLookupDto>>> GetMainCategoryLookupAsync()
    {
        var items = await _context.MainCategories
            .AsNoTracking()
            .Where(x => x.Status == "Active")
            .OrderBy(x => x.Code)
            .Select(x => new MainCategoryLookupDto(x.Id, x.Code, x.Name))
            .ToListAsync();

        return ApiResponse<List<MainCategoryLookupDto>>.Ok(items);
    }

    // ── Sub Categories ───────────────────────────────────────

    public async Task<ApiResponse<PagedResponse<SubCategoryResponse>>> GetAllSubCategoriesAsync(
        int page, int pageSize, string? search, string? status, Guid? mainCategoryId)
    {
        IQueryable<SubCategory> query = _context.SubCategories
            .AsNoTracking()
            .Include(x => x.MainCategory);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.Name.Contains(search) || x.Code.Contains(search));

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.Status == status);

        if (mainCategoryId.HasValue)
            query = query.Where(x => x.MainCategoryId == mainCategoryId.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.ToResponse())
            .ToListAsync();

        return ApiResponse<PagedResponse<SubCategoryResponse>>.Ok(
            new PagedResponse<SubCategoryResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<SubCategoryResponse>> GetSubCategoryByIdAsync(Guid id)
    {
        var entity = await _context.SubCategories
            .AsNoTracking()
            .Include(x => x.MainCategory)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<SubCategoryResponse>.Fail($"SubCategory with ID '{id}' not found.");

        return ApiResponse<SubCategoryResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<SubCategoryResponse>> CreateSubCategoryAsync(
        CreateSubCategoryRequest request, string createdBy)
    {
        var mainCategory = await _context.MainCategories.FindAsync(request.MainCategoryId);
        if (mainCategory is null)
            return ApiResponse<SubCategoryResponse>.Fail($"MainCategory with ID '{request.MainCategoryId}' not found.");

        var entity = new SubCategory
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            Status = request.Status,
            MainCategoryId = request.MainCategoryId,
            CreatedBy = createdBy
        };

        _context.SubCategories.Add(entity);
        await _context.SaveChangesAsync();

        return ApiResponse<SubCategoryResponse>.Ok(entity.ToResponse(), "SubCategory created successfully.");
    }

    public async Task<ApiResponse<SubCategoryResponse>> UpdateSubCategoryAsync(
        Guid id, UpdateSubCategoryRequest request, string updatedBy)
    {
        var entity = await _context.SubCategories
            .Include(x => x.MainCategory)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<SubCategoryResponse>.Fail($"SubCategory with ID '{id}' not found.");

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.Status = request.Status;
        entity.MainCategoryId = request.MainCategoryId;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<SubCategoryResponse>.Ok(entity.ToResponse(), "SubCategory updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateSubCategoryStatusAsync(
        Guid id, UpdateStatusRequest request, string updatedBy)
    {
        var entity = await _context.SubCategories.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"SubCategory with ID '{id}' not found.");

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "SubCategory status updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteSubCategoryAsync(Guid id, string deletedBy)
    {
        var entity = await _context.SubCategories.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"SubCategory with ID '{id}' not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "SubCategory deleted successfully.");
    }

    // ── Brands ───────────────────────────────────────────────

    public async Task<ApiResponse<PagedResponse<BrandResponse>>> GetAllBrandsAsync(
        int page, int pageSize, string? search, string? status)
    {
        var query = _context.Brands.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.Name.Contains(search) || x.Code.Contains(search));

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.Status == status);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.ToResponse())
            .ToListAsync();

        return ApiResponse<PagedResponse<BrandResponse>>.Ok(
            new PagedResponse<BrandResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<BrandResponse>> GetBrandByIdAsync(Guid id)
    {
        var entity = await _context.Brands
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<BrandResponse>.Fail($"Brand with ID '{id}' not found.");

        return ApiResponse<BrandResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<BrandResponse>> CreateBrandAsync(
        CreateBrandRequest request, string createdBy)
    {
        var entity = new Brand
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            Status = request.Status,
            CreatedBy = createdBy
        };

        _context.Brands.Add(entity);
        await _context.SaveChangesAsync();

        return ApiResponse<BrandResponse>.Ok(entity.ToResponse(), "Brand created successfully.");
    }

    public async Task<ApiResponse<BrandResponse>> UpdateBrandAsync(
        Guid id, UpdateBrandRequest request, string updatedBy)
    {
        var entity = await _context.Brands.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<BrandResponse>.Fail($"Brand with ID '{id}' not found.");

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<BrandResponse>.Ok(entity.ToResponse(), "Brand updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateBrandStatusAsync(
        Guid id, UpdateStatusRequest request, string updatedBy)
    {
        var entity = await _context.Brands.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Brand with ID '{id}' not found.");

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Brand status updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteBrandAsync(Guid id, string deletedBy)
    {
        var entity = await _context.Brands.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Brand with ID '{id}' not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Brand deleted successfully.");
    }

    // ── Warehouses ───────────────────────────────────────────

    public async Task<ApiResponse<PagedResponse<WarehouseResponse>>> GetAllWarehousesAsync(
        int page, int pageSize, string? search, string? status)
    {
        var query = _context.Warehouses.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.Name.Contains(search) || x.Code.Contains(search));

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.Status == status);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.ToResponse())
            .ToListAsync();

        return ApiResponse<PagedResponse<WarehouseResponse>>.Ok(
            new PagedResponse<WarehouseResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<WarehouseResponse>> GetWarehouseByIdAsync(Guid id)
    {
        var entity = await _context.Warehouses
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<WarehouseResponse>.Fail($"Warehouse with ID '{id}' not found.");

        return ApiResponse<WarehouseResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<WarehouseResponse>> CreateWarehouseAsync(
        CreateWarehouseRequest request, string createdBy)
    {
        var entity = new Warehouse
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            Location = request.Location,
            Status = request.Status,
            CreatedBy = createdBy
        };

        _context.Warehouses.Add(entity);
        await _context.SaveChangesAsync();

        return ApiResponse<WarehouseResponse>.Ok(entity.ToResponse(), "Warehouse created successfully.");
    }

    public async Task<ApiResponse<WarehouseResponse>> UpdateWarehouseAsync(
        Guid id, UpdateWarehouseRequest request, string updatedBy)
    {
        var entity = await _context.Warehouses.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<WarehouseResponse>.Fail($"Warehouse with ID '{id}' not found.");

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.Location = request.Location;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<WarehouseResponse>.Ok(entity.ToResponse(), "Warehouse updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateWarehouseStatusAsync(
        Guid id, UpdateStatusRequest request, string updatedBy)
    {
        var entity = await _context.Warehouses.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Warehouse with ID '{id}' not found.");

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Warehouse status updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteWarehouseAsync(Guid id, string deletedBy)
    {
        var entity = await _context.Warehouses.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Warehouse with ID '{id}' not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Warehouse deleted successfully.");
    }

    // ── Product Groups ───────────────────────────────────────

    public async Task<ApiResponse<PagedResponse<ProductGroupResponse>>> GetAllProductGroupsAsync(
        int page, int pageSize, string? search, string? status)
    {
        var query = _context.ProductGroups.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.Name.Contains(search) || x.Code.Contains(search));

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.Status == status);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.ToResponse())
            .ToListAsync();

        return ApiResponse<PagedResponse<ProductGroupResponse>>.Ok(
            new PagedResponse<ProductGroupResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<ProductGroupResponse>> GetProductGroupByIdAsync(Guid id)
    {
        var entity = await _context.ProductGroups
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<ProductGroupResponse>.Fail($"ProductGroup with ID '{id}' not found.");

        return ApiResponse<ProductGroupResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<ProductGroupResponse>> CreateProductGroupAsync(
        CreateProductGroupRequest request, string createdBy)
    {
        var entity = new ProductGroup
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            Status = request.Status,
            CreatedBy = createdBy
        };

        _context.ProductGroups.Add(entity);
        await _context.SaveChangesAsync();

        return ApiResponse<ProductGroupResponse>.Ok(entity.ToResponse(), "ProductGroup created successfully.");
    }

    public async Task<ApiResponse<ProductGroupResponse>> UpdateProductGroupAsync(
        Guid id, UpdateProductGroupRequest request, string updatedBy)
    {
        var entity = await _context.ProductGroups.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<ProductGroupResponse>.Fail($"ProductGroup with ID '{id}' not found.");

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<ProductGroupResponse>.Ok(entity.ToResponse(), "ProductGroup updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateProductGroupStatusAsync(
        Guid id, UpdateStatusRequest request, string updatedBy)
    {
        var entity = await _context.ProductGroups.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"ProductGroup with ID '{id}' not found.");

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "ProductGroup status updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteProductGroupAsync(Guid id, string deletedBy)
    {
        var entity = await _context.ProductGroups.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"ProductGroup with ID '{id}' not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "ProductGroup deleted successfully.");
    }

    // ── Transporters ─────────────────────────────────────────

    public async Task<ApiResponse<PagedResponse<TransporterResponse>>> GetAllTransportersAsync(
        int page, int pageSize, string? search, string? status)
    {
        var query = _context.Transporters.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.Name.Contains(search) || x.Code.Contains(search));

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.Status == status);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.ToResponse())
            .ToListAsync();

        return ApiResponse<PagedResponse<TransporterResponse>>.Ok(
            new PagedResponse<TransporterResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<TransporterResponse>> GetTransporterByIdAsync(Guid id)
    {
        var entity = await _context.Transporters
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<TransporterResponse>.Fail($"Transporter with ID '{id}' not found.");

        return ApiResponse<TransporterResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<TransporterResponse>> CreateTransporterAsync(
        CreateTransporterRequest request, string createdBy)
    {
        var entity = new Transporter
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            ContactPerson = request.ContactPerson,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            Status = request.Status,
            CreatedBy = createdBy
        };

        _context.Transporters.Add(entity);
        await _context.SaveChangesAsync();

        return ApiResponse<TransporterResponse>.Ok(entity.ToResponse(), "Transporter created successfully.");
    }

    public async Task<ApiResponse<TransporterResponse>> UpdateTransporterAsync(
        Guid id, UpdateTransporterRequest request, string updatedBy)
    {
        var entity = await _context.Transporters.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<TransporterResponse>.Fail($"Transporter with ID '{id}' not found.");

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.ContactPerson = request.ContactPerson;
        entity.Phone = request.Phone;
        entity.Email = request.Email;
        entity.Address = request.Address;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<TransporterResponse>.Ok(entity.ToResponse(), "Transporter updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateTransporterStatusAsync(
        Guid id, UpdateStatusRequest request, string updatedBy)
    {
        var entity = await _context.Transporters.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Transporter with ID '{id}' not found.");

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Transporter status updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteTransporterAsync(Guid id, string deletedBy)
    {
        var entity = await _context.Transporters.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Transporter with ID '{id}' not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Transporter deleted successfully.");
    }
}
