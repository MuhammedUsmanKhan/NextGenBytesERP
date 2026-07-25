using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SupplyChainManagement.Domain.Definitions;

namespace SupplyChainManagement.Infrastructure.Persistence.Configurations;

public sealed class TransporterConfiguration : IEntityTypeConfiguration<Transporter>
{
    public void Configure(EntityTypeBuilder<Transporter> builder)
    {
        builder.ToTable("Transporters");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Name)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.ContactPerson)
            .HasMaxLength(256);

        builder.Property(x => x.Phone)
            .HasMaxLength(50);

        builder.Property(x => x.Email)
            .HasMaxLength(256);

        builder.Property(x => x.Address)
            .HasMaxLength(512);

        builder.Property(x => x.Status)
            .HasMaxLength(20)
            .IsRequired()
            .HasDefaultValue("Active");

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(256);

        builder.HasIndex(x => x.Code).IsUnique();

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
