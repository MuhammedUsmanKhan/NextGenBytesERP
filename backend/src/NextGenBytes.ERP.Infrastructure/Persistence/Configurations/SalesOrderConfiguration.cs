using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.SalesOrders;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations;

public sealed class SalesOrderConfiguration : IEntityTypeConfiguration<SalesOrder>
{
    public void Configure(EntityTypeBuilder<SalesOrder> builder)
    {
        builder.ToTable("salesorder");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.SalesOrderNumber)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.OrderDate)
            .IsRequired();

        builder.Property(x => x.CustomerPurchaseOrderNumber)
            .HasMaxLength(100);

        builder.Property(x => x.CycleShot)
            .HasMaxLength(256);

        builder.Property(x => x.Status)
            .HasMaxLength(20)
            .IsRequired()
            .HasDefaultValue("Open");

        builder.Property(x => x.Remarks)
            .HasMaxLength(1000);

        builder.Property(x => x.SubTotal)
            .HasColumnType("decimal(18,4)")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.DiscountAmount)
            .HasColumnType("decimal(18,4)")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.TaxAmount)
            .HasColumnType("decimal(18,4)")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.GrandTotal)
            .HasColumnType("decimal(18,4)")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(256);

        builder.HasOne(x => x.Customer)
            .WithMany()
            .HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Warehouse)
            .WithMany()
            .HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Department)
            .WithMany()
            .HasForeignKey(x => x.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.SalesOrderNumber).IsUnique();

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
