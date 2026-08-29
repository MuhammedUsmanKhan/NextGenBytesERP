using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Common.Interfaces;
using NextGenBytes.ERP.Application.SalesOrders.DTOs;
using NextGenBytes.ERP.Application.SalesOrders.Interfaces;
using NextGenBytes.ERP.Domain.SalesOrders;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.SalesOrders.Services;

public sealed class SalesOrderService : ISalesOrderService
{
    private const string CodePrefix = "SO-";

    private readonly AppDbContext _context;
    private readonly ISequenceService _sequenceService;

    public SalesOrderService(AppDbContext context, ISequenceService sequenceService)
    {
        _context = context;
        _sequenceService = sequenceService;
    }

    public async Task<ApiResponse<PagedResponse<SalesOrderResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status)
    {
        IQueryable<SalesOrder> query = _context.SalesOrders
            .AsNoTracking()
            .Include(x => x.Customer)
            .Include(x => x.Warehouse)
            .Include(x => x.Department);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x =>
                x.SalesOrderNumber.Contains(search) ||
                x.Customer.CompanyName.Contains(search));

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.Status == status);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.OrderDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.ToResponse())
            .ToListAsync();

        return ApiResponse<PagedResponse<SalesOrderResponse>>.Ok(
            new PagedResponse<SalesOrderResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<SalesOrderResponse>> GetByIdAsync(Guid id)
    {
        var entity = await _context.SalesOrders
            .AsNoTracking()
            .Include(x => x.Customer)
            .Include(x => x.Warehouse)
            .Include(x => x.Department)
            .Include(x => x.Items)
                .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<SalesOrderResponse>.Fail($"Sales Order with ID '{id}' not found.");

        return ApiResponse<SalesOrderResponse>.Ok(entity.ToResponse());
    }

    public async Task<ApiResponse<SalesOrderResponse>> CreateAsync(
        CreateSalesOrderRequest request, string createdBy)
    {
        if (request.Items is null || request.Items.Count == 0)
            return ApiResponse<SalesOrderResponse>.Fail("At least one item is required.");

        await using var tx = await _context.Database.BeginTransactionAsync();

        try
        {
            var customer = await _context.Customers
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.CustomerId && !x.IsDeleted);

            if (customer is null)
            {
                await tx.RollbackAsync();
                return ApiResponse<SalesOrderResponse>.Fail($"Customer with ID '{request.CustomerId}' not found.");
            }

            if (request.WarehouseId.HasValue)
            {
                var warehouse = await _context.Warehouses
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == request.WarehouseId.Value && !x.IsDeleted);

                if (warehouse is null)
                {
                    await tx.RollbackAsync();
                    return ApiResponse<SalesOrderResponse>.Fail($"Warehouse with ID '{request.WarehouseId}' not found.");
                }
            }

            if (request.DepartmentId.HasValue)
            {
                var department = await _context.Departments
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == request.DepartmentId.Value && !x.IsDeleted);

                if (department is null)
                {
                    await tx.RollbackAsync();
                    return ApiResponse<SalesOrderResponse>.Fail($"Department with ID '{request.DepartmentId}' not found.");
                }
            }

            foreach (var item in request.Items)
            {
                var product = await _context.Products
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == item.ProductId && !x.IsDeleted);

                if (product is null)
                {
                    await tx.RollbackAsync();
                    return ApiResponse<SalesOrderResponse>.Fail($"Product with ID '{item.ProductId}' not found.");
                }

                if (item.Quantity <= 0)
                {
                    await tx.RollbackAsync();
                    return ApiResponse<SalesOrderResponse>.Fail($"Quantity must be greater than 0 for product '{product.Name}'.");
                }

                if (item.UnitPrice < 0)
                {
                    await tx.RollbackAsync();
                    return ApiResponse<SalesOrderResponse>.Fail($"Unit price cannot be negative for product '{product.Name}'.");
                }
            }

            var nextNumber = await _sequenceService.GetNextSequenceAsync("SalesOrder", "DEFAULT");
            var salesOrderNumber = $"{CodePrefix}{nextNumber:D6}";

            var salesOrder = new SalesOrder
            {
                Id = Guid.NewGuid(),
                SalesOrderNumber = salesOrderNumber,
                OrderDate = request.OrderDate,
                CustomerId = request.CustomerId,
                CustomerPurchaseOrderNumber = request.CustomerPurchaseOrderNumber,
                ExpectedDeliveryDate = request.ExpectedDeliveryDate,
                WarehouseId = request.WarehouseId,
                DepartmentId = request.DepartmentId,
                CycleShot = request.CycleShot,
                Status = "Open",
                Remarks = request.Remarks,
                DiscountAmount = request.DiscountAmount,
                TaxAmount = request.TaxAmount,
                CreatedBy = createdBy
            };

            decimal subTotal = 0;

            foreach (var item in request.Items)
            {
                var lineAmount = item.Quantity * item.UnitPrice;
                subTotal += lineAmount;

                salesOrder.Items.Add(new SalesOrderItem
                {
                    Id = Guid.NewGuid(),
                    SalesOrderId = salesOrder.Id,
                    ProductId = item.ProductId,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    LineAmount = lineAmount,
                    CreatedBy = createdBy
                });
            }

            salesOrder.SubTotal = subTotal;
            salesOrder.GrandTotal = subTotal - salesOrder.DiscountAmount + salesOrder.TaxAmount;

            _context.SalesOrders.Add(salesOrder);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            var saved = await _context.SalesOrders
                .AsNoTracking()
                .Include(x => x.Customer)
                .Include(x => x.Warehouse)
                .Include(x => x.Department)
                .Include(x => x.Items)
                    .ThenInclude(x => x.Product)
                .FirstAsync(x => x.Id == salesOrder.Id);

            return ApiResponse<SalesOrderResponse>.Ok(
                saved.ToResponse(), $"Sales Order created successfully. Number: {salesOrderNumber}");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ApiResponse<SalesOrderResponse>> UpdateAsync(
        Guid id, UpdateSalesOrderRequest request, string updatedBy)
    {
        if (request.Items is null || request.Items.Count == 0)
            return ApiResponse<SalesOrderResponse>.Fail("At least one item is required.");

        var entity = await _context.SalesOrders
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<SalesOrderResponse>.Fail($"Sales Order with ID '{id}' not found.");

        if (entity.Status != "Open")
            return ApiResponse<SalesOrderResponse>.Fail("Only Open sales orders can be updated.");

        var customer = await _context.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.CustomerId && !x.IsDeleted);

        if (customer is null)
            return ApiResponse<SalesOrderResponse>.Fail($"Customer with ID '{request.CustomerId}' not found.");

        if (request.WarehouseId.HasValue)
        {
            var warehouse = await _context.Warehouses
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.WarehouseId.Value && !x.IsDeleted);

            if (warehouse is null)
                return ApiResponse<SalesOrderResponse>.Fail($"Warehouse with ID '{request.WarehouseId}' not found.");
        }

        if (request.DepartmentId.HasValue)
        {
            var department = await _context.Departments
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.DepartmentId.Value && !x.IsDeleted);

            if (department is null)
                return ApiResponse<SalesOrderResponse>.Fail($"Department with ID '{request.DepartmentId}' not found.");
        }

        foreach (var item in request.Items)
        {
            var product = await _context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == item.ProductId && !x.IsDeleted);

            if (product is null)
                return ApiResponse<SalesOrderResponse>.Fail($"Product with ID '{item.ProductId}' not found.");

            if (item.Quantity <= 0)
                return ApiResponse<SalesOrderResponse>.Fail($"Quantity must be greater than 0 for product '{product.Name}'.");

            if (item.UnitPrice < 0)
                return ApiResponse<SalesOrderResponse>.Fail($"Unit price cannot be negative for product '{product.Name}'.");
        }

        entity.OrderDate = request.OrderDate;
        entity.CustomerId = request.CustomerId;
        entity.CustomerPurchaseOrderNumber = request.CustomerPurchaseOrderNumber;
        entity.ExpectedDeliveryDate = request.ExpectedDeliveryDate;
        entity.WarehouseId = request.WarehouseId;
        entity.DepartmentId = request.DepartmentId;
        entity.CycleShot = request.CycleShot;
        entity.Remarks = request.Remarks;
        entity.DiscountAmount = request.DiscountAmount;
        entity.TaxAmount = request.TaxAmount;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        foreach (var item in entity.Items.ToList())
        {
            _context.Entry(item).State = EntityState.Deleted;
        }

        decimal subTotal = 0;

        foreach (var item in request.Items)
        {
            var lineAmount = item.Quantity * item.UnitPrice;
            subTotal += lineAmount;

            _context.SalesOrderItems.Add(new SalesOrderItem
            {
                Id = Guid.NewGuid(),
                SalesOrderId = entity.Id,
                ProductId = item.ProductId,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineAmount = lineAmount,
                CreatedBy = updatedBy
            });
        }

        entity.SubTotal = subTotal;
        entity.GrandTotal = subTotal - entity.DiscountAmount + entity.TaxAmount;

        await _context.SaveChangesAsync();

        var saved = await _context.SalesOrders
            .AsNoTracking()
            .Include(x => x.Customer)
            .Include(x => x.Warehouse)
            .Include(x => x.Department)
            .Include(x => x.Items)
                .ThenInclude(x => x.Product)
            .FirstAsync(x => x.Id == entity.Id);

        return ApiResponse<SalesOrderResponse>.Ok(saved.ToResponse(), "Sales Order updated successfully.");
    }

    public async Task<ApiResponse<SalesOrderResponse>> CloseAsync(Guid id, string updatedBy)
    {
        var entity = await _context.SalesOrders
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<SalesOrderResponse>.Fail($"Sales Order with ID '{id}' not found.");

        if (entity.Status != "Open")
            return ApiResponse<SalesOrderResponse>.Fail("Only Open sales orders can be closed.");

        entity.Status = "Closed";
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        var saved = await _context.SalesOrders
            .AsNoTracking()
            .Include(x => x.Customer)
            .Include(x => x.Warehouse)
            .Include(x => x.Department)
            .Include(x => x.Items)
                .ThenInclude(x => x.Product)
            .FirstAsync(x => x.Id == entity.Id);

        return ApiResponse<SalesOrderResponse>.Ok(saved.ToResponse(), "Sales Order closed successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy)
    {
        var entity = await _context.SalesOrders.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<bool>.Fail($"Sales Order with ID '{id}' not found.");

        if (entity.Status != "Open")
            return ApiResponse<bool>.Fail("Only Open sales orders can be deleted.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = deletedBy;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Sales Order deleted successfully.");
    }
}
