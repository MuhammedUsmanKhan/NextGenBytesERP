using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Common.Interfaces;
using NextGenBytes.ERP.Application.Definitions.DTOs;
using NextGenBytes.ERP.Application.Definitions.Interfaces;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Definitions.Services;

public sealed class CustomerService : ICustomerService
{
    private const string CustomerCodePrefix = "10-01-03-";

    private readonly AppDbContext _context;
    private readonly ISequenceService _sequenceService;

    public CustomerService(AppDbContext context, ISequenceService sequenceService)
    {
        _context = context;
        _sequenceService = sequenceService;
    }

    public async Task<ApiResponse<PagedResponse<CustomerResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status)
    {
        var query = _context.Set<Customer>().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.CompanyName.Contains(search) || x.CustomerCode.Contains(search));

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.Status == status);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.CustomerCode)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.ToResponse())
            .ToListAsync();

        return ApiResponse<PagedResponse<CustomerResponse>>.Ok(
            new PagedResponse<CustomerResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<CustomerResponse>> GetByIdAsync(Guid id)
    {
        var entity = await _context.Set<Customer>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<CustomerResponse>.Fail($"Customer with ID '{id}' not found.");

        return ApiResponse<CustomerResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<CustomerResponse>> CreateAsync(
        CreateCustomerRequest request, string createdBy)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();

        try
        {
            var nextNumber = await _sequenceService.GetNextSequenceAsync("Customer", "DEFAULT");
            var customerCode = $"{CustomerCodePrefix}{nextNumber:D6}";

            var entity = new Customer
            {
                Id = Guid.NewGuid(),
                CustomerCode = customerCode,
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

            _context.Set<Customer>().Add(entity);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return ApiResponse<CustomerResponse>.Ok(entity.ToResponse(), $"Customer created successfully. Code: {customerCode}");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ApiResponse<CustomerResponse>> UpdateAsync(
        Guid id, UpdateCustomerRequest request, string updatedBy)
    {
        var entity = await _context.Set<Customer>().FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<CustomerResponse>.Fail($"Customer with ID '{id}' not found.");

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

        return ApiResponse<CustomerResponse>.Ok(entity.ToResponse(), "Customer updated successfully.");
    }

    public async Task<ApiResponse<bool>> UpdateStatusAsync(
        Guid id, UpdateStatusRequest request, string updatedBy)
    {
        var entity = await _context.Set<Customer>().FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Customer with ID '{id}' not found.");

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Customer status updated successfully.");
    }

    public async Task<ApiResponse<NextCustomerCodeResponse>> GetNextCustomerCodeAsync()
    {
        var nextNumber = await _sequenceService.PeekNextSequenceAsync("Customer", "DEFAULT");
        var customerCode = $"{CustomerCodePrefix}{nextNumber:D6}";

        return ApiResponse<NextCustomerCodeResponse>.Ok(
            new NextCustomerCodeResponse(customerCode));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy)
    {
        var entity = await _context.Set<Customer>().FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Customer with ID '{id}' not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Customer deleted successfully.");
    }
}