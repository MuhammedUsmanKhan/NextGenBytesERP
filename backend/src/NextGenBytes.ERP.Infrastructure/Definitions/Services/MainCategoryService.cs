using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Common.Interfaces;
using NextGenBytes.ERP.Application.Definitions.DTOs;
using NextGenBytes.ERP.Application.Definitions.Interfaces;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Definitions.Services;

public sealed class MainCategoryService : IMainCategoryService
{
    private const string CodePrefix = "MC-";

    private readonly AppDbContext _context;
    private readonly ISequenceService _sequenceService;

    public MainCategoryService(AppDbContext context, ISequenceService sequenceService)
    {
        _context = context;
        _sequenceService = sequenceService;
    }

    public async Task<ApiResponse<PagedResponse<MainCategoryResponse>>> GetAllAsync(
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

    public async Task<ApiResponse<MainCategoryResponse>> GetByIdAsync(Guid id)
    {
        var entity = await _context.MainCategories
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<MainCategoryResponse>.Fail($"MainCategory with ID '{id}' not found.");

        return ApiResponse<MainCategoryResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<MainCategoryResponse>> CreateAsync(
        CreateMainCategoryRequest request, string createdBy)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();

        try
        {
            var nextNumber = await _sequenceService.GetNextSequenceAsync("MainCategory", "DEFAULT");
            var code = $"{CodePrefix}{nextNumber:D6}";

            var entity = new MainCategory
            {
                Id = Guid.NewGuid(),
                Code = code,
                Name = request.Name,
                Status = request.Status,
                CreatedBy = createdBy
            };

            _context.MainCategories.Add(entity);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return ApiResponse<MainCategoryResponse>.Ok(entity.ToResponse(), $"MainCategory created successfully. Code: {code}");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ApiResponse<MainCategoryResponse>> UpdateAsync(
        Guid id, UpdateMainCategoryRequest request, string updatedBy)
    {
        var entity = await _context.MainCategories.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<MainCategoryResponse>.Fail($"MainCategory with ID '{id}' not found.");

        entity.Name = request.Name;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<MainCategoryResponse>.Ok(entity.ToResponse(), "MainCategory updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateStatusAsync(
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

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy)
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

    public async Task<ApiResponse<NextCodeResponse>> GetNextCodeAsync()
    {
        var nextNumber = await _sequenceService.PeekNextSequenceAsync("MainCategory", "DEFAULT");
        var code = $"{CodePrefix}{nextNumber:D6}";

        return ApiResponse<NextCodeResponse>.Ok(new NextCodeResponse(code));
    }

    public async Task<ApiResponse<List<MainCategoryLookupDto>>> GetLookupAsync()
    {
        var items = await _context.MainCategories
            .AsNoTracking()
            .Where(x => x.Status == "Active")
            .OrderBy(x => x.Code)
            .Select(x => new MainCategoryLookupDto(x.Id, x.Code, x.Name))
            .ToListAsync();

        return ApiResponse<List<MainCategoryLookupDto>>.Ok(items);
    }
}
