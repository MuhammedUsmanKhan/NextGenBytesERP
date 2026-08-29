using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Common.Interfaces;
using NextGenBytes.ERP.Application.Definitions.DTOs;
using NextGenBytes.ERP.Application.Definitions.Interfaces;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Definitions.Services;

public sealed class DepartmentService : IDepartmentService
{
    private const string CodePrefix = "DEPT-";

    private readonly AppDbContext _context;
    private readonly ISequenceService _sequenceService;

    public DepartmentService(AppDbContext context, ISequenceService sequenceService)
    {
        _context = context;
        _sequenceService = sequenceService;
    }

    public async Task<ApiResponse<PagedResponse<DepartmentResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status)
    {
        var query = _context.Departments.AsNoTracking();

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

        return ApiResponse<PagedResponse<DepartmentResponse>>.Ok(
            new PagedResponse<DepartmentResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<DepartmentResponse>> GetByIdAsync(Guid id)
    {
        var entity = await _context.Departments
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<DepartmentResponse>.Fail($"Department with ID '{id}' not found.");

        return ApiResponse<DepartmentResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<DepartmentResponse>> CreateAsync(
        CreateDepartmentRequest request, string createdBy)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();

        try
        {
            var nextNumber = await _sequenceService.GetNextSequenceAsync("Department", "DEFAULT");
            var code = $"{CodePrefix}{nextNumber:D6}";

            var entity = new Department
            {
                Id = Guid.NewGuid(),
                Code = code,
                Name = request.Name,
                Status = request.Status,
                CreatedBy = createdBy
            };

            _context.Departments.Add(entity);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return ApiResponse<DepartmentResponse>.Ok(entity.ToResponse(), $"Department created successfully. Code: {code}");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ApiResponse<DepartmentResponse>> UpdateAsync(
        Guid id, UpdateDepartmentRequest request, string updatedBy)
    {
        var entity = await _context.Departments.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<DepartmentResponse>.Fail($"Department with ID '{id}' not found.");

        entity.Name = request.Name;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<DepartmentResponse>.Ok(entity.ToResponse(), "Department updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateStatusAsync(
        Guid id, UpdateStatusRequest request, string updatedBy)
    {
        var entity = await _context.Departments.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Department with ID '{id}' not found.");

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Department status updated successfully.");
    }

    public async Task<ApiResponse<NextCodeResponse>> GetNextCodeAsync()
    {
        var nextNumber = await _sequenceService.PeekNextSequenceAsync("Department", "DEFAULT");
        var code = $"{CodePrefix}{nextNumber:D6}";

        return ApiResponse<NextCodeResponse>.Ok(new NextCodeResponse(code));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy)
    {
        var entity = await _context.Departments.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Department with ID '{id}' not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Department deleted successfully.");
    }
}
