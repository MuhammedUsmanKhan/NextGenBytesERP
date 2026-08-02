using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Common.Interfaces;
using NextGenBytes.ERP.Application.Products.DTOs;
using NextGenBytes.ERP.Application.Products.Interfaces;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Domain.Products;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Products.Services;

public sealed class ProductService : IProductService
{
    private readonly AppDbContext _context;
    private readonly ISequenceService _sequenceService;

    public ProductService(AppDbContext context, ISequenceService sequenceService)
    {
        _context = context;
        _sequenceService = sequenceService;
    }

    public async Task<ApiResponse<PagedResponse<ProductResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status, Guid? productTypeId)
    {
        IQueryable<Product> query = _context.Products
            .AsNoTracking()
            .Include(x => x.ProductType)
            .Include(x => x.Category)
            .Include(x => x.SubCategory)
            .Include(x => x.Brand)
            .Include(x => x.ProductGroup)
            .Include(x => x.Unit);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.Name.Contains(search) || x.ProductCode.Contains(search));

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.Status == status);

        if (productTypeId.HasValue)
            query = query.Where(x => x.ProductTypeId == productTypeId.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.ProductCode)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.ToResponse())
            .ToListAsync();

        return ApiResponse<PagedResponse<ProductResponse>>.Ok(
            new PagedResponse<ProductResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<ProductResponse>> GetByIdAsync(Guid id)
    {
        var entity = await _context.Products
            .AsNoTracking()
            .Include(x => x.ProductType)
            .Include(x => x.Category)
            .Include(x => x.SubCategory)
            .Include(x => x.Brand)
            .Include(x => x.ProductGroup)
            .Include(x => x.Unit)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<ProductResponse>.Fail($"Product with ID '{id}' not found.");

        return ApiResponse<ProductResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<ProductResponse>> CreateAsync(
        CreateProductRequest request, string createdBy)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();

        try
        {
            // 1. Read ProductType for CodePrefix and Scope
            var productType = await _context.ProductTypes
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.ProductTypeId);

            if (productType is null)
            {
                await tx.RollbackAsync();
                return ApiResponse<ProductResponse>.Fail($"ProductType with ID '{request.ProductTypeId}' not found.");
            }

            // 2. Get next sequence number via generic service
            var nextNumber = await _sequenceService.GetNextSequenceAsync("Product", productType.Code);

            // 3. Generate product code (same logic as before)
            var productCode = (productType.CodePrefix + nextNumber).ToString();

            // 4. Create product
            var product = new Product
            {
                Id = Guid.NewGuid(),
                ProductCode = productCode,
                Name = request.Name,
                ProductTypeId = request.ProductTypeId,
                CategoryId = request.CategoryId,
                SubCategoryId = request.SubCategoryId,
                BrandId = request.BrandId,
                ProductGroupId = request.ProductGroupId,
                UnitId = request.UnitId,
                Weight = request.Weight,
                ThicknessGSM = request.ThicknessGSM,
                ColorScheme = request.ColorScheme,
                Status = request.Status,
                CreatedBy = createdBy
            };

            _context.Products.Add(product);

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            // Reload with navigations for response
            var saved = await _context.Products
                .AsNoTracking()
                .Include(x => x.ProductType)
                .Include(x => x.Category)
                .Include(x => x.SubCategory)
                .Include(x => x.Brand)
                .Include(x => x.ProductGroup)
                .Include(x => x.Unit)
                .FirstAsync(x => x.Id == product.Id);

            return ApiResponse<ProductResponse>.Ok(saved.ToResponse(), $"Product created successfully. Code: {productCode}");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ApiResponse<ProductResponse>> UpdateAsync(
        Guid id, UpdateProductRequest request, string updatedBy)
    {
        var entity = await _context.Products
            .Include(x => x.ProductType)
            .Include(x => x.Category)
            .Include(x => x.SubCategory)
            .Include(x => x.Brand)
            .Include(x => x.ProductGroup)
            .Include(x => x.Unit)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<ProductResponse>.Fail($"Product with ID '{id}' not found.");

        entity.Name = request.Name;
        entity.ProductTypeId = request.ProductTypeId;
        entity.CategoryId = request.CategoryId;
        entity.SubCategoryId = request.SubCategoryId;
        entity.BrandId = request.BrandId;
        entity.ProductGroupId = request.ProductGroupId;
        entity.UnitId = request.UnitId;
        entity.Weight = request.Weight;
        entity.ThicknessGSM = request.ThicknessGSM;
        entity.ColorScheme = request.ColorScheme;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<ProductResponse>.Ok(entity.ToResponse(), "Product updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateStatusAsync(
        Guid id, UpdateStatusRequest request, string updatedBy)
    {
        var entity = await _context.Products.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Product with ID '{id}' not found.");

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Product status updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy)
    {
        var entity = await _context.Products.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Product with ID '{id}' not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Product deleted successfully.");
    }

    public async Task<ApiResponse<NextProductCodeResponse>> GetNextProductCodeAsync(Guid productTypeId)
    {
        var productType = await _context.ProductTypes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == productTypeId);

        if (productType is null)
            return ApiResponse<NextProductCodeResponse>.Fail($"ProductType with ID '{productTypeId}' not found.");

        var nextNumber = await _sequenceService.PeekNextSequenceAsync("Product", productType.Code);
        var productCode = (productType.CodePrefix + nextNumber).ToString();

        return ApiResponse<NextProductCodeResponse>.Ok(
            new NextProductCodeResponse(productTypeId, productCode));
    }
}
