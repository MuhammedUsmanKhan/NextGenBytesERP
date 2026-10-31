using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations.Payroll;

public sealed class ShiftRosterAssignmentConfiguration : IEntityTypeConfiguration<ShiftRosterAssignment>
{
    public void Configure(EntityTypeBuilder<ShiftRosterAssignment> builder)
    {
        builder.ToTable("ShiftRosterAssignments");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ShiftName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.ShiftDurationMinutes)
            .IsRequired()
            .HasDefaultValue(840);

        builder.Property(x => x.IsOvernightShift)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.PayMultiplier)
            .HasPrecision(4, 2)
            .IsRequired()
            .HasDefaultValue(1.5m);

        builder.Property(x => x.ExcuseOverlappingDayShift)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.Reason)
            .HasMaxLength(250);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(256);

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.EmployeeId, x.Date })
            .IsUnique();
    }
}
