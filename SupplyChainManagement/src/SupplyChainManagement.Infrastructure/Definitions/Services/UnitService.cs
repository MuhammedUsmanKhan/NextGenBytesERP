using Microsoft.EntityFrameworkCore;
using SupplyChainManagement.Application.Common;
using SupplyChainManagement.Application.Definitions.DTOs;
using SupplyChainManagement.Application.Definitions.Interfaces;
using SupplyChainManagement.Domain.Definitions;
using SupplyChainManagement.Infrastructure.Persistence;

namespace SupplyChainManagement.Infrastructure.Definitions.Services;

public sealed class UnitService : IUnitService
{
    private readonly AppDbContext _context;

    public UnitService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResponse<UnitResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status)
    {
        var query = _context.Units.AsNoTracking();

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

        return ApiResponse<PagedResponse<UnitResponse>>.Ok(
            new PagedResponse<UnitResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<UnitResponse>> GetByIdAsync(Guid id)
    {
        var entity = await _context.Units
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<UnitResponse>.Fail($"Unit with ID '{id}' not found.");

        return ApiResponse<UnitResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<UnitResponse>> CreateAsync(
        CreateUnitRequest request, string createdBy)
    {
        var entity = new Unit
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            ShortName = request.ShortName,
            DecimalPlaces = request.DecimalPlaces,
            Status = request.Status,
            CreatedBy = createdBy
        };

        _context.Units.Add(entity);
        await _context.SaveChangesAsync();

        return ApiResponse<UnitResponse>.Ok(entity.ToResponse(), "Unit created successfully.");
    }

    public async Task<ApiResponse<UnitResponse>> UpdateAsync(
        Guid id, UpdateUnitRequest request, string updatedBy)
    {
        var entity = await _context.Units.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<UnitResponse>.Fail($"Unit with ID '{id}' not found.");

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.ShortName = request.ShortName;
        entity.DecimalPlaces = request.DecimalPlaces;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<UnitResponse>.Ok(entity.ToResponse(), "Unit updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateStatusAsync(
        Guid id, UpdateStatusRequest request, string updatedBy)
    {
        var entity = await _context.Units.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Unit with ID '{id}' not found.");

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Unit status updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy)
    {
        var entity = await _context.Units.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Unit with ID '{id}' not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Unit deleted successfully.");
    }
}
