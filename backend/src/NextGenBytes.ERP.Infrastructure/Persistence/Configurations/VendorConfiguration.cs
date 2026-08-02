using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.Definitions;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations;

public sealed class VendorConfiguration : IEntityTypeConfiguration<Vendor>
{
    public void Configure(EntityTypeBuilder<Vendor> builder)
    {
        builder.ToTable("Vendors");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.VendorCode)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.CompanyName)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.ContactPerson)
            .HasMaxLength(256);

        builder.Property(x => x.Email)
            .HasMaxLength(256);

        builder.Property(x => x.CountryId)
            .HasMaxLength(50);

        builder.Property(x => x.CityId)
            .HasMaxLength(50);

        builder.Property(x => x.PostalCode)
            .HasMaxLength(20);

        builder.Property(x => x.Address)
            .HasMaxLength(500);

        builder.Property(x => x.Area)
            .HasMaxLength(200);

        builder.Property(x => x.CNIC)
            .HasMaxLength(50);

        builder.Property(x => x.NTN)
            .HasMaxLength(50);

        builder.Property(x => x.STRN)
            .HasMaxLength(50);

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

        builder.HasIndex(x => x.VendorCode).IsUnique();

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
