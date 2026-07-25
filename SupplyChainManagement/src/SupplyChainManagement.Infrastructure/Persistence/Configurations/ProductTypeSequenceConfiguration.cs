using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SupplyChainManagement.Domain.Definitions;

namespace SupplyChainManagement.Infrastructure.Persistence.Configurations;

public sealed class ProductTypeSequenceConfiguration : IEntityTypeConfiguration<ProductTypeSequence>
{
    public void Configure(EntityTypeBuilder<ProductTypeSequence> builder)
    {
        builder.ToTable("ProductTypeSequences");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.LastNumber)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => x.ProductTypeId).IsUnique();

        builder.HasOne<ProductType>()
            .WithMany()
            .HasForeignKey(x => x.ProductTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
