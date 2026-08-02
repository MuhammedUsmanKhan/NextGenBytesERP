using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Common.Interfaces;
using NextGenBytes.ERP.Application.Definitions.DTOs;
using NextGenBytes.ERP.Application.Definitions.Interfaces;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Definitions.Services;

public sealed class VendorService : IVendorService
{
    private const string VendorCodePrefix = "20-01-01-";

    private readonly AppDbContext _context;
    private readonly ISequenceService _sequenceService;

    public VendorService(AppDbContext context, ISequenceService sequenceService)
    {
        _context = context;
        _sequenceService = sequenceService;
    }

    public async Task<ApiResponse<PagedResponse<VendorResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status)
    {
        var query = _context.Set<Vendor>().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.CompanyName.Contains(search) || x.VendorCode.Contains(search));

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.Status == status);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.VendorCode)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.ToResponse())
            .ToListAsync();

        return ApiResponse<PagedResponse<VendorResponse>>.Ok(
            new PagedResponse<VendorResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<VendorResponse>> GetByIdAsync(Guid id)
    {
        var entity = await _context.Set<Vendor>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<VendorResponse>.Fail($"Vendor with ID '{id}' not found.");

        return ApiResponse<VendorResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<VendorResponse>> CreateAsync(
        CreateVendorRequest request, string createdBy)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();

        try
        {
            var nextNumber = await _sequenceService.GetNextSequenceAsync("Vendor", "DEFAULT");
            var vendorCode = $"{VendorCodePrefix}{nextNumber:D6}";

            var entity = new Vendor
            {
                Id = Guid.NewGuid(),
                VendorCode = vendorCode,
                CompanyName = request.CompanyName,
                ContactPerson = request.ContactPerson,
                Email = request.Email,
                CountryId = request.CountryId,
                CityId = request.CityId,
                PostalCode = request.PostalCode,
                Address = request.Address,
                Area = request.Area,
                CNIC = request.CNIC,
                NTN = request.NTN,
                STRN = request.STRN,
                Status = request.Status,
                CreatedBy = createdBy
            };

            _context.Set<Vendor>().Add(entity);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return ApiResponse<VendorResponse>.Ok(entity.ToResponse(), $"Vendor created successfully. Code: {vendorCode}");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ApiResponse<VendorResponse>> UpdateAsync(
        Guid id, UpdateVendorRequest request, string updatedBy)
    {
        var entity = await _context.Set<Vendor>().FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<VendorResponse>.Fail($"Vendor with ID '{id}' not found.");

        entity.CompanyName = request.CompanyName;
        entity.ContactPerson = request.ContactPerson;
        entity.Email = request.Email;
        entity.CountryId = request.CountryId;
        entity.CityId = request.CityId;
        entity.PostalCode = request.PostalCode;
        entity.Address = request.Address;
        entity.Area = request.Area;
        entity.CNIC = request.CNIC;
        entity.NTN = request.NTN;
        entity.STRN = request.STRN;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<VendorResponse>.Ok(entity.ToResponse(), "Vendor updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateStatusAsync(
        Guid id, UpdateStatusRequest request, string updatedBy)
    {
        var entity = await _context.Set<Vendor>().FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Vendor with ID '{id}' not found.");

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Vendor status updated successfully.");
    }

    public async Task<ApiResponse<NextVendorCodeResponse>> GetNextVendorCodeAsync()
    {
        var nextNumber = await _sequenceService.PeekNextSequenceAsync("Vendor", "DEFAULT");
        var vendorCode = $"{VendorCodePrefix}{nextNumber:D6}";

        return ApiResponse<NextVendorCodeResponse>.Ok(
            new NextVendorCodeResponse(vendorCode));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy)
    {
        var entity = await _context.Set<Vendor>().FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Vendor with ID '{id}' not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Vendor deleted successfully.");
    }
}
