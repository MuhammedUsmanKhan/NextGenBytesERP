using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations.Payroll;

public sealed class EmployeeContractConfiguration : IEntityTypeConfiguration<EmployeeContract>
{
    public void Configure(EntityTypeBuilder<EmployeeContract> builder)
    {
        builder.ToTable("EmployeeContracts");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.BasicRate)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.AttendanceAllowance)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.OtherAllowances)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.DailyShiftHours)
            .HasPrecision(5, 2)
            .HasDefaultValue(10m);

        builder.Property(x => x.OvertimeMultiplier)
            .HasPrecision(5, 2)
            .HasDefaultValue(1.5m);

        builder.Property(x => x.MonthlyDivisorDays)
            .HasDefaultValue(30);

        builder.Property(x => x.NightShiftMinutes)
            .HasDefaultValue(840);

        builder.Property(x => x.GraceAbsentDays)
            .HasDefaultValue(1);

        builder.Property(x => x.OvertimeEligible)
            .HasDefaultValue(true);

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.Property(x => x.BankName)
            .HasMaxLength(100);

        builder.Property(x => x.BankAccountNumber)
            .HasMaxLength(50);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(256);

        builder.HasOne(x => x.Employee)
            .WithMany(e => e.Contracts)
            .HasForeignKey(x => x.EmployeeId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.EmployeeId, x.IsActive });
    }
}
