using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Common.Interfaces;
using NextGenBytes.ERP.Application.Definitions.DTOs;
using NextGenBytes.ERP.Application.Definitions.Interfaces;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Definitions.Services;

public sealed class WarehouseService : IWarehouseService
{
    private const string CodePrefix = "WH-";

    private readonly AppDbContext _context;
    private readonly ISequenceService _sequenceService;

    public WarehouseService(AppDbContext context, ISequenceService sequenceService)
    {
        _context = context;
        _sequenceService = sequenceService;
    }

    public async Task<ApiResponse<PagedResponse<WarehouseResponse>>> GetAllAsync(
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

    public async Task<ApiResponse<WarehouseResponse>> GetByIdAsync(Guid id)
    {
        var entity = await _context.Warehouses
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<WarehouseResponse>.Fail($"Warehouse with ID '{id}' not found.");

        return ApiResponse<WarehouseResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<WarehouseResponse>> CreateAsync(
        CreateWarehouseRequest request, string createdBy)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();

        try
        {
            var nextNumber = await _sequenceService.GetNextSequenceAsync("Warehouse", "DEFAULT");
            var code = $"{CodePrefix}{nextNumber:D6}";

            var entity = new Warehouse
            {
                Id = Guid.NewGuid(),
                Code = code,
                Name = request.Name,
                Location = request.Location,
                Status = request.Status,
                CreatedBy = createdBy
            };

            _context.Warehouses.Add(entity);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return ApiResponse<WarehouseResponse>.Ok(entity.ToResponse(), $"Warehouse created successfully. Code: {code}");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ApiResponse<WarehouseResponse>> UpdateAsync(
        Guid id, UpdateWarehouseRequest request, string updatedBy)
    {
        var entity = await _context.Warehouses.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<WarehouseResponse>.Fail($"Warehouse with ID '{id}' not found.");

        entity.Name = request.Name;
        entity.Location = request.Location;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<WarehouseResponse>.Ok(entity.ToResponse(), "Warehouse updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateStatusAsync(
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

    public async Task<ApiResponse<NextCodeResponse>> GetNextCodeAsync()
    {
        var nextNumber = await _sequenceService.PeekNextSequenceAsync("Warehouse", "DEFAULT");
        var code = $"{CodePrefix}{nextNumber:D6}";

        return ApiResponse<NextCodeResponse>.Ok(new NextCodeResponse(code));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy)
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
}
