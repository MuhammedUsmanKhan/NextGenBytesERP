using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations.Payroll;

public sealed class AttendanceSummaryConfiguration : IEntityTypeConfiguration<AttendanceSummary>
{
    public void Configure(EntityTypeBuilder<AttendanceSummary> builder)
    {
        builder.ToTable("AttendanceSummaries");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.MonthYear)
            .HasMaxLength(7)
            .IsRequired();

        builder.Property(x => x.DaysPresent)
            .HasPrecision(5, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.AbsentDays)
            .HasPrecision(5, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.OvertimeHours)
            .HasPrecision(5, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(256);

        builder.HasOne(x => x.Employee)
            .WithMany(e => e.AttendanceSummaries)
            .HasForeignKey(x => x.EmployeeId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.EmployeeId, x.MonthYear }).IsUnique();
    }
}
