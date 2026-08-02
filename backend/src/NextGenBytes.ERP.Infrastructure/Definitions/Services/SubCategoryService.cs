using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Common.Interfaces;
using NextGenBytes.ERP.Application.Definitions.DTOs;
using NextGenBytes.ERP.Application.Definitions.Interfaces;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Definitions.Services;

public sealed class SubCategoryService : ISubCategoryService
{
    private const string CodePrefix = "SC-";

    private readonly AppDbContext _context;
    private readonly ISequenceService _sequenceService;

    public SubCategoryService(AppDbContext context, ISequenceService sequenceService)
    {
        _context = context;
        _sequenceService = sequenceService;
    }

    public async Task<ApiResponse<PagedResponse<SubCategoryResponse>>> GetAllAsync(
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

    public async Task<ApiResponse<SubCategoryResponse>> GetByIdAsync(Guid id)
    {
        var entity = await _context.SubCategories
            .AsNoTracking()
            .Include(x => x.MainCategory)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<SubCategoryResponse>.Fail($"SubCategory with ID '{id}' not found.");

        return ApiResponse<SubCategoryResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<SubCategoryResponse>> CreateAsync(
        CreateSubCategoryRequest request, string createdBy)
    {
        var mainCategory = await _context.MainCategories.FindAsync(request.MainCategoryId);
        if (mainCategory is null)
            return ApiResponse<SubCategoryResponse>.Fail($"MainCategory with ID '{request.MainCategoryId}' not found.");

        await using var tx = await _context.Database.BeginTransactionAsync();

        try
        {
            var nextNumber = await _sequenceService.GetNextSequenceAsync("SubCategory", "DEFAULT");
            var code = $"{CodePrefix}{nextNumber:D6}";

            var entity = new SubCategory
            {
                Id = Guid.NewGuid(),
                Code = code,
                Name = request.Name,
                Status = request.Status,
                MainCategoryId = request.MainCategoryId,
                CreatedBy = createdBy
            };

            _context.SubCategories.Add(entity);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return ApiResponse<SubCategoryResponse>.Ok(entity.ToResponse(), $"SubCategory created successfully. Code: {code}");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ApiResponse<SubCategoryResponse>> UpdateAsync(
        Guid id, UpdateSubCategoryRequest request, string updatedBy)
    {
        var entity = await _context.SubCategories
            .Include(x => x.MainCategory)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<SubCategoryResponse>.Fail($"SubCategory with ID '{id}' not found.");

        entity.Name = request.Name;
        entity.Status = request.Status;
        entity.MainCategoryId = request.MainCategoryId;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<SubCategoryResponse>.Ok(entity.ToResponse(), "SubCategory updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateStatusAsync(
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

    public async Task<ApiResponse<NextCodeResponse>> GetNextCodeAsync()
    {
        var nextNumber = await _sequenceService.PeekNextSequenceAsync("SubCategory", "DEFAULT");
        var code = $"{CodePrefix}{nextNumber:D6}";

        return ApiResponse<NextCodeResponse>.Ok(new NextCodeResponse(code));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy)
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
}
