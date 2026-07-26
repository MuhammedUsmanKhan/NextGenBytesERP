using Microsoft.EntityFrameworkCore;
using SupplyChainManagement.Application.Common;
using SupplyChainManagement.Application.Products.DTOs;
using SupplyChainManagement.Application.Products.Interfaces;
using SupplyChainManagement.Domain.Definitions;
using SupplyChainManagement.Domain.Products;
using SupplyChainManagement.Infrastructure.Persistence;

namespace SupplyChainManagement.Infrastructure.Products.Services;

public sealed class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
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
            // 1. Lock the sequence row with UPDLOCK
            await _context.Database.ExecuteSqlRawAsync(
                "SELECT 1 FROM ProductTypeSequences WITH (UPDLOCK, ROWLOCK) WHERE ProductTypeId = {0}",
                request.ProductTypeId);

            // 2. Read current sequence
            var sequence = await _context.ProductTypeSequences
                .FirstOrDefaultAsync(x => x.ProductTypeId == request.ProductTypeId);

            if (sequence is null)
            {
                await tx.RollbackAsync();
                return ApiResponse<ProductResponse>.Fail(
                    $"No sequence found for ProductTypeId '{request.ProductTypeId}'. Ensure the ProductType has an associated sequence.");
            }

            // 3. Read CodePrefix from ProductType
            var productType = await _context.ProductTypes
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.ProductTypeId);

            if (productType is null)
            {
                await tx.RollbackAsync();
                return ApiResponse<ProductResponse>.Fail($"ProductType with ID '{request.ProductTypeId}' not found.");
            }

            // 4. Increment and generate code
            var newNumber = sequence.LastNumber + 1;
            var productCode = (productType.CodePrefix + newNumber).ToString();

            // 5. Create product
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

            // 6. Update sequence
            sequence.LastNumber = newNumber;
            sequence.UpdatedAt = DateTime.UtcNow;

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

        var sequence = await _context.ProductTypeSequences
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.ProductTypeId == productTypeId);

        if (sequence is null)
            return ApiResponse<NextProductCodeResponse>.Fail($"No sequence found for ProductTypeId '{productTypeId}'.");

        var nextNumber = sequence.LastNumber + 1;
        var productCode = (productType.CodePrefix + nextNumber).ToString();

        return ApiResponse<NextProductCodeResponse>.Ok(
            new NextProductCodeResponse(productTypeId, productCode));
    }
}
