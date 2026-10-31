using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations.Payroll;

public sealed class DailyAttendanceConfiguration : IEntityTypeConfiguration<DailyAttendance>
{
    public void Configure(EntityTypeBuilder<DailyAttendance> builder)
    {
        builder.ToTable("DailyAttendances");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Source)
            .HasMaxLength(50)
            .IsRequired()
            .HasDefaultValue("DAT_IMPORT");

        builder.Property(x => x.ExceptionType)
            .HasMaxLength(50);

        builder.Property(x => x.ResolvedBy)
            .HasMaxLength(256);

        builder.Property(x => x.ResolutionNotes)
            .HasMaxLength(500);

        builder.Property(x => x.ShiftPayMultiplier)
            .HasPrecision(4, 2);

        builder.Property(x => x.PendingPayMultiplier)
            .HasPrecision(4, 2);

        builder.Property(x => x.ImportBatchId)
            .HasMaxLength(50);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(256);

        builder.HasIndex(x => new { x.EmployeeId, x.Date }).IsUnique();
        builder.HasIndex(x => new { x.Date, x.HasException, x.IsResolved });

        builder.HasOne(x => x.Employee)
            .WithMany(e => e.DailyAttendances)
            .HasForeignKey(x => x.EmployeeId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
