using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations.Payroll;

public sealed class RawPunchLogConfiguration : IEntityTypeConfiguration<RawPunchLog>
{
    public void Configure(EntityTypeBuilder<RawPunchLog> builder)
    {
        builder.ToTable("RawPunchLogs");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.BiometricDeviceId)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.TerminalId)
            .HasDefaultValue(1);

        builder.Property(x => x.PunchState)
            .HasDefaultValue(0);

        builder.Property(x => x.WorkCode)
            .HasDefaultValue(0);

        builder.Property(x => x.ImportBatchId)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.IsDuplicateFiltered)
            .HasDefaultValue(false);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => new { x.BiometricDeviceId, x.PunchTimestamp });
        builder.HasIndex(x => x.ImportBatchId);

        builder.HasOne(x => x.Employee)
            .WithMany(e => e.RawPunchLogs)
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

