using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SupplyChainManagement.Domain.Definitions;
using SupplyChainManagement.Domain.Inventory;
using SupplyChainManagement.Domain.Products;

namespace SupplyChainManagement.Infrastructure.Persistence.Configurations;

public sealed class OpeningStockConfiguration : IEntityTypeConfiguration<OpeningStock>
{
    public void Configure(EntityTypeBuilder<OpeningStock> builder)
    {
        builder.ToTable("OpeningStocks");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Quantity)
            .HasColumnType("decimal(18,4)")
            .IsRequired();

        builder.Property(x => x.AverageCost)
            .HasColumnType("decimal(18,4)")
            .IsRequired();

        builder.Property(x => x.TransactionDate)
            .IsRequired();

        builder.Property(x => x.Remarks)
            .HasMaxLength(500);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(256);

        builder.HasOne<Product>()
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Warehouse>()
            .WithMany()
            .HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
