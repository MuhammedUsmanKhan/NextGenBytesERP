using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Common.Interfaces;
using NextGenBytes.ERP.Application.Definitions.DTOs;
using NextGenBytes.ERP.Application.Definitions.Interfaces;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Definitions.Services;

public sealed class TransporterService : ITransporterService
{
    private const string CodePrefix = "TR-";

    private readonly AppDbContext _context;
    private readonly ISequenceService _sequenceService;

    public TransporterService(AppDbContext context, ISequenceService sequenceService)
    {
        _context = context;
        _sequenceService = sequenceService;
    }

    public async Task<ApiResponse<PagedResponse<TransporterResponse>>> GetAllAsync(
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

    public async Task<ApiResponse<TransporterResponse>> GetByIdAsync(Guid id)
    {
        var entity = await _context.Transporters
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<TransporterResponse>.Fail($"Transporter with ID '{id}' not found.");

        return ApiResponse<TransporterResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<TransporterResponse>> CreateAsync(
        CreateTransporterRequest request, string createdBy)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();

        try
        {
            var nextNumber = await _sequenceService.GetNextSequenceAsync("Transporter", "DEFAULT");
            var code = $"{CodePrefix}{nextNumber:D6}";

            var entity = new Transporter
            {
                Id = Guid.NewGuid(),
                Code = code,
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
            await tx.CommitAsync();

            return ApiResponse<TransporterResponse>.Ok(entity.ToResponse(), $"Transporter created successfully. Code: {code}");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ApiResponse<TransporterResponse>> UpdateAsync(
        Guid id, UpdateTransporterRequest request, string updatedBy)
    {
        var entity = await _context.Transporters.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<TransporterResponse>.Fail($"Transporter with ID '{id}' not found.");

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

    public async Task<ApiResponse<bool>> UpdateStatusAsync(
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

    public async Task<ApiResponse<NextCodeResponse>> GetNextCodeAsync()
    {
        var nextNumber = await _sequenceService.PeekNextSequenceAsync("Transporter", "DEFAULT");
        var code = $"{CodePrefix}{nextNumber:D6}";

        return ApiResponse<NextCodeResponse>.Ok(new NextCodeResponse(code));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy)
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
