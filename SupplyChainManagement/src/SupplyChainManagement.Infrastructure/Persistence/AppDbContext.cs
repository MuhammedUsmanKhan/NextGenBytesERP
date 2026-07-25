using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using SupplyChainManagement.Domain.Audit;
using SupplyChainManagement.Domain.Authentication;
using SupplyChainManagement.Domain.Definitions;
using SupplyChainManagement.Domain.Inventory;
using SupplyChainManagement.Domain.Products;
using SupplyChainManagement.Infrastructure.Identity;
using SupplyChainManagement.Infrastructure.Persistence.Seed;
using InvEntity = SupplyChainManagement.Domain.Inventory.Inventory;

namespace SupplyChainManagement.Infrastructure.Persistence;

public sealed class AppDbContext
    : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    private readonly IHttpContextAccessor? _httpContextAccessor;

    public AppDbContext(DbContextOptions<AppDbContext> options, IHttpContextAccessor? httpContextAccessor = null)
        : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<MainCategory> MainCategories => Set<MainCategory>();
    public DbSet<SubCategory> SubCategories => Set<SubCategory>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<ProductGroup> ProductGroups => Set<ProductGroup>();
    public DbSet<Transporter> Transporters => Set<Transporter>();
    public DbSet<ProductType> ProductTypes => Set<ProductType>();
    public DbSet<ProductTypeSequence> ProductTypeSequences => Set<ProductTypeSequence>();
    public DbSet<Unit> Units => Set<Unit>();

    public DbSet<Product> Products => Set<Product>();

    public DbSet<OpeningStock> OpeningStocks => Set<OpeningStock>();
    public DbSet<InvEntity> Inventories => Set<InvEntity>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        AuthSeedData.Seed(builder);
        DefinitionsSeedData.Seed(builder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var auditEntries = CaptureAuditEntries();

        var result = await base.SaveChangesAsync(cancellationToken);

        if (auditEntries.Count > 0)
        {
            AuditLogs.AddRange(auditEntries);
            await base.SaveChangesAsync(cancellationToken);
        }

        return result;
    }

    private List<AuditLog> CaptureAuditEntries()
    {
        var entries = new List<AuditLog>();
        var userId = _httpContextAccessor?.HttpContext?.User?.Identity?.Name ?? "system";
        var ipAddress = _httpContextAccessor?.HttpContext?.Connection?.RemoteIpAddress?.ToString();

        var changedEntries = ChangeTracker.Entries()
            .Where(e => e.Entity is not AuditLog &&
                        e.Entity is not ProductTypeSequence &&
                        e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .ToList();

        foreach (var entry in changedEntries)
        {
            var entityType = entry.Entity.GetType().Name;
            var entityId = GetEntityId(entry);
            var action = entry.State switch
            {
                EntityState.Added => "Created",
                EntityState.Modified => "Updated",
                EntityState.Deleted => "Deleted",
                _ => "Unknown"
            };

            string? oldValues = null;
            string? newValues = null;

            if (entry.State == EntityState.Modified)
            {
                var original = entry.OriginalValues.ToObject() as Dictionary<string, object?>
                    ?? [];
                var current = entry.CurrentValues.ToObject() as Dictionary<string, object?>
                    ?? [];

                var changedOld = new Dictionary<string, object?>();
                var changedNew = new Dictionary<string, object?>();

                foreach (var prop in entry.Properties)
                {
                    if (prop.IsModified && prop.Metadata.Name != "UpdatedAt" && prop.Metadata.Name != "UpdatedBy")
                    {
                        changedOld[prop.Metadata.Name] = prop.OriginalValue;
                        changedNew[prop.Metadata.Name] = prop.CurrentValue;
                    }
                }

                if (changedOld.Count > 0)
                {
                    oldValues = JsonSerializer.Serialize(changedOld);
                    newValues = JsonSerializer.Serialize(changedNew);
                }
            }
            else if (entry.State == EntityState.Added)
            {
                newValues = JsonSerializer.Serialize(entry.CurrentValues.ToObject());
            }
            else if (entry.State == EntityState.Deleted)
            {
                oldValues = JsonSerializer.Serialize(entry.OriginalValues.ToObject());
            }

            entries.Add(new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Entity = entityType,
                EntityId = entityId,
                Action = action,
                OldValues = oldValues,
                NewValues = newValues,
                IPAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            });
        }

        return entries;
    }

    private static Guid GetEntityId(EntityEntry entry)
    {
        var key = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
        return key?.CurrentValue is Guid guid ? guid : Guid.Empty;
    }
}
