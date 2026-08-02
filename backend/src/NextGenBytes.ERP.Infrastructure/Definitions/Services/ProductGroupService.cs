using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Common.Interfaces;
using NextGenBytes.ERP.Application.Definitions.DTOs;
using NextGenBytes.ERP.Application.Definitions.Interfaces;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Definitions.Services;

public sealed class ProductGroupService : IProductGroupService
{
    private const string CodePrefix = "PG-";

    private readonly AppDbContext _context;
    private readonly ISequenceService _sequenceService;

    public ProductGroupService(AppDbContext context, ISequenceService sequenceService)
    {
        _context = context;
        _sequenceService = sequenceService;
    }

    public async Task<ApiResponse<PagedResponse<ProductGroupResponse>>> GetAllAsync(
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

    public async Task<ApiResponse<ProductGroupResponse>> GetByIdAsync(Guid id)
    {
        var entity = await _context.ProductGroups
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<ProductGroupResponse>.Fail($"ProductGroup with ID '{id}' not found.");

        return ApiResponse<ProductGroupResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<ProductGroupResponse>> CreateAsync(
        CreateProductGroupRequest request, string createdBy)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();

        try
        {
            var nextNumber = await _sequenceService.GetNextSequenceAsync("ProductGroup", "DEFAULT");
            var code = $"{CodePrefix}{nextNumber:D6}";

            var entity = new ProductGroup
            {
                Id = Guid.NewGuid(),
                Code = code,
                Name = request.Name,
                Status = request.Status,
                CreatedBy = createdBy
            };

            _context.ProductGroups.Add(entity);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return ApiResponse<ProductGroupResponse>.Ok(entity.ToResponse(), $"ProductGroup created successfully. Code: {code}");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ApiResponse<ProductGroupResponse>> UpdateAsync(
        Guid id, UpdateProductGroupRequest request, string updatedBy)
    {
        var entity = await _context.ProductGroups.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<ProductGroupResponse>.Fail($"ProductGroup with ID '{id}' not found.");

        entity.Name = request.Name;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<ProductGroupResponse>.Ok(entity.ToResponse(), "ProductGroup updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateStatusAsync(
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

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy)
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

    public async Task<ApiResponse<NextCodeResponse>> GetNextCodeAsync()
    {
        var nextNumber = await _sequenceService.PeekNextSequenceAsync("ProductGroup", "DEFAULT");
        var code = $"{CodePrefix}{nextNumber:D6}";

        return ApiResponse<NextCodeResponse>.Ok(new NextCodeResponse(code));
    }
}
