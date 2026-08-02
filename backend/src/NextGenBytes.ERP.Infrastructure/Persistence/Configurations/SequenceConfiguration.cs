using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.Definitions;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations;

public sealed class SequenceConfiguration : IEntityTypeConfiguration<Sequence>
{
    public void Configure(EntityTypeBuilder<Sequence> builder)
    {
        builder.ToTable("Sequences");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.EntityName)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Scope)
            .HasMaxLength(50)
            .IsRequired()
            .HasDefaultValue("DEFAULT");

        builder.Property(x => x.LastNumber)
            .IsRequired()
            .HasDefaultValue(0L);

        builder.Property(x => x.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => new { x.EntityName, x.Scope }).IsUnique();
    }
}
