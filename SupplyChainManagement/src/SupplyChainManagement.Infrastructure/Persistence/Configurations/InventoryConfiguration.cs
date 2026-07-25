using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SupplyChainManagement.Domain.Definitions;
using SupplyChainManagement.Domain.Products;
using Inv = SupplyChainManagement.Domain.Inventory.Inventory;

namespace SupplyChainManagement.Infrastructure.Persistence.Configurations;

public sealed class InventoryConfiguration : IEntityTypeConfiguration<Inv>
{
    public void Configure(EntityTypeBuilder<Inv> builder)
    {
        builder.ToTable("Inventories");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.QuantityOnHand)
            .HasColumnType("decimal(18,4)")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.ReservedQuantity)
            .HasColumnType("decimal(18,4)")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.AverageCost)
            .HasColumnType("decimal(18,4)")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.MinStock)
            .HasColumnType("decimal(18,4)");

        builder.Property(x => x.MaxStock)
            .HasColumnType("decimal(18,4)");

        builder.Property(x => x.ReorderLevel)
            .HasColumnType("decimal(18,4)");

        builder.Property(x => x.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Warehouse)
            .WithMany()
            .HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.ProductId, x.WarehouseId }).IsUnique();

        builder.Property(x => x.AvailableQuantity)
            .HasColumnType("decimal(18,4)")
            .HasComputedColumnSql("[QuantityOnHand] - [ReservedQuantity]");

        builder.HasQueryFilter(x => x.Product != null && !x.Product.IsDeleted);
    }
}
