using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SupplyChainManagement.Domain.Definitions;
using SupplyChainManagement.Domain.Inventory;
using SupplyChainManagement.Domain.Products;

namespace SupplyChainManagement.Infrastructure.Persistence.Configurations;

public sealed class InventoryTransactionConfiguration : IEntityTypeConfiguration<InventoryTransaction>
{
    public void Configure(EntityTypeBuilder<InventoryTransaction> builder)
    {
        builder.ToTable("InventoryTransactions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TransactionType)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.ReferenceType)
            .HasMaxLength(100);

        builder.Property(x => x.Quantity)
            .HasColumnType("decimal(18,4)")
            .IsRequired();

        builder.Property(x => x.UnitCost)
            .HasColumnType("decimal(18,4)")
            .IsRequired();

        builder.Property(x => x.TransactionDate)
            .IsRequired();

        builder.Property(x => x.Remarks)
            .HasMaxLength(500);

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Warehouse)
            .WithMany()
            .HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.TransactionDate);
        builder.HasIndex(x => x.TransactionType);

        builder.HasQueryFilter(x => x.Product != null && !x.Product.IsDeleted);
    }
}
