using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Definitions.DTOs;
using NextGenBytes.ERP.Application.Definitions.Interfaces;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Definitions.Services;

public sealed class ProductTypeService : IProductTypeService
{
    private readonly AppDbContext _context;

    public ProductTypeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResponse<ProductTypeResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status)
    {
        var query = _context.ProductTypes.AsNoTracking();

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

        return ApiResponse<PagedResponse<ProductTypeResponse>>.Ok(
            new PagedResponse<ProductTypeResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<ProductTypeResponse>> GetByIdAsync(Guid id)
    {
        var entity = await _context.ProductTypes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<ProductTypeResponse>.Fail($"ProductType with ID '{id}' not found.");

        return ApiResponse<ProductTypeResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<ProductTypeResponse>> CreateAsync(
        CreateProductTypeRequest request, string createdBy)
    {
        var entity = new ProductType
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            CodePrefix = request.CodePrefix,
            Status = request.Status,
            CreatedBy = createdBy
        };

        _context.ProductTypes.Add(entity);

        var sequence = new Sequence
        {
            Id = Guid.NewGuid(),
            EntityName = "Product",
            Scope = request.Code,
            LastNumber = 0
        };

        _context.Sequences.Add(sequence);

        await _context.SaveChangesAsync();

        return ApiResponse<ProductTypeResponse>.Ok(entity.ToResponse(), "ProductType created successfully.");
    }

    public async Task<ApiResponse<ProductTypeResponse>> UpdateAsync(
        Guid id, UpdateProductTypeRequest request, string updatedBy)
    {
        var entity = await _context.ProductTypes.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<ProductTypeResponse>.Fail($"ProductType with ID '{id}' not found.");

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<ProductTypeResponse>.Ok(entity.ToResponse(), "ProductType updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateStatusAsync(
        Guid id, UpdateStatusRequest request, string updatedBy)
    {
        var entity = await _context.ProductTypes.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"ProductType with ID '{id}' not found.");

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "ProductType status updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy)
    {
        var entity = await _context.ProductTypes.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"ProductType with ID '{id}' not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "ProductType deleted successfully.");
    }
}
