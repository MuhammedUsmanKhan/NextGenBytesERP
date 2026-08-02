using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Inventory.DTOs;
using NextGenBytes.ERP.Application.Inventory.Interfaces;
using NextGenBytes.ERP.Domain.Inventory;
using NextGenBytes.ERP.Infrastructure.Persistence;
using InvEntity = NextGenBytes.ERP.Domain.Inventory.Inventory;

namespace NextGenBytes.ERP.Infrastructure.Inventory.Services;

public sealed class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResponse<InventoryResponse>>> GetAllInventoryAsync(
        int page, int pageSize, Guid? warehouseId, Guid? productId, bool? belowReorder)
    {
        IQueryable<InvEntity> query = _context.Inventories
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.Warehouse);

        if (warehouseId.HasValue)
            query = query.Where(x => x.WarehouseId == warehouseId.Value);

        if (productId.HasValue)
            query = query.Where(x => x.ProductId == productId.Value);

        if (belowReorder.HasValue && belowReorder.Value)
            query = query.Where(x => x.ReorderLevel.HasValue && x.QuantityOnHand <= x.ReorderLevel);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.Product!.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var responseItems = items.Select(x => x.ToResponse(
            x.Product!.Name,
            x.Product!.ProductCode,
            x.Warehouse!.Name)).ToList();

        return ApiResponse<PagedResponse<InventoryResponse>>.Ok(
            new PagedResponse<InventoryResponse>
            {
                Items = responseItems,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<InventoryResponse>> GetInventoryAsync(Guid productId, Guid warehouseId)
    {
        var entity = await _context.Inventories
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.Warehouse)
            .FirstOrDefaultAsync(x => x.ProductId == productId && x.WarehouseId == warehouseId);

        if (entity is null)
            return ApiResponse<InventoryResponse>.Fail($"Inventory not found for ProductId '{productId}' and WarehouseId '{warehouseId}'.");

        return ApiResponse<InventoryResponse>.Ok(entity.ToResponse(
            entity.Product!.Name,
            entity.Product!.ProductCode,
            entity.Warehouse!.Name));
    }

    public async Task<ApiResponse<InventoryResponse>> CreateOpeningStockAsync(
        OpeningStockRequest request, string createdBy)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();

        try
        {
            // 1. Insert OpeningStock record
            var openingStock = new OpeningStock
            {
                Id = Guid.NewGuid(),
                ProductId = request.ProductId,
                WarehouseId = request.WarehouseId,
                Quantity = request.Quantity,
                AverageCost = request.AverageCost,
                TransactionDate = request.TransactionDate,
                Remarks = request.Remarks,
                CreatedBy = createdBy
            };
            _context.OpeningStocks.Add(openingStock);

            // 2. Insert InventoryTransaction
            var transaction = new InventoryTransaction
            {
                Id = Guid.NewGuid(),
                ProductId = request.ProductId,
                WarehouseId = request.WarehouseId,
                TransactionType = "OpeningStock",
                Quantity = request.Quantity,
                UnitCost = request.AverageCost,
                TransactionDate = request.TransactionDate,
                Remarks = request.Remarks,
                CreatedBy = createdBy
            };
            _context.InventoryTransactions.Add(transaction);

            // 3. Upsert Inventory
            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(x => x.ProductId == request.ProductId && x.WarehouseId == request.WarehouseId);

            if (inventory is null)
            {
                inventory = new InvEntity
                {
                    Id = Guid.NewGuid(),
                    ProductId = request.ProductId,
                    WarehouseId = request.WarehouseId,
                    QuantityOnHand = request.Quantity,
                    ReservedQuantity = 0,
                    AverageCost = request.AverageCost
                };
                _context.Inventories.Add(inventory);
            }
            else
            {
                var totalQty = inventory.QuantityOnHand + request.Quantity;
                inventory.AverageCost = totalQty > 0
                    ? ((inventory.QuantityOnHand * inventory.AverageCost) + (request.Quantity * request.AverageCost)) / totalQty
                    : 0;
                inventory.QuantityOnHand += request.Quantity;
            }

            inventory.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            // Reload with navigations
            var saved = await _context.Inventories
                .AsNoTracking()
                .Include(x => x.Product)
                .Include(x => x.Warehouse)
                .FirstAsync(x => x.Id == inventory.Id);

            return ApiResponse<InventoryResponse>.Ok(saved.ToResponse(
                saved.Product!.Name,
                saved.Product!.ProductCode,
                saved.Warehouse!.Name), "Opening stock created successfully.");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ApiResponse<PagedResponse<InventoryTransactionResponse>>> GetTransactionsAsync(
        int page, int pageSize, Guid? productId, Guid? warehouseId, string? type, DateTime? dateFrom, DateTime? dateTo)
    {
        IQueryable<InventoryTransaction> query = _context.InventoryTransactions
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.Warehouse);

        if (productId.HasValue)
            query = query.Where(x => x.ProductId == productId.Value);

        if (warehouseId.HasValue)
            query = query.Where(x => x.WarehouseId == warehouseId.Value);

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(x => x.TransactionType == type);

        if (dateFrom.HasValue)
            query = query.Where(x => x.TransactionDate >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(x => x.TransactionDate <= dateTo.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var responseItems = items.Select(x => x.ToResponse(
            x.Product!.Name,
            x.Product!.ProductCode,
            x.Warehouse!.Name)).ToList();

        return ApiResponse<PagedResponse<InventoryTransactionResponse>>.Ok(
            new PagedResponse<InventoryTransactionResponse>
            {
                Items = responseItems,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<InventoryTransactionResponse>> GetTransactionByIdAsync(Guid id)
    {
        var entity = await _context.InventoryTransactions
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.Warehouse)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            return ApiResponse<InventoryTransactionResponse>.Fail($"InventoryTransaction with ID '{id}' not found.");

        return ApiResponse<InventoryTransactionResponse>.Ok(entity.ToResponse(
            entity.Product!.Name,
            entity.Product!.ProductCode,
            entity.Warehouse!.Name));
    }
}
