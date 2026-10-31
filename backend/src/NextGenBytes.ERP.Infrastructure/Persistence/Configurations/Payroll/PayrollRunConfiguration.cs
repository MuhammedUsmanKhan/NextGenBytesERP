using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations.Payroll;

public sealed class PayrollRunConfiguration : IEntityTypeConfiguration<PayrollRun>
{
    public void Configure(EntityTypeBuilder<PayrollRun> builder)
    {
        builder.ToTable("PayrollRuns");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.MonthYear)
            .HasMaxLength(7)
            .IsRequired();

        builder.Property(x => x.DepartmentCategory)
            .HasMaxLength(50);

        builder.Property(x => x.TotalGrossSalary)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.TotalDeductions)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.TotalDueGross)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.TotalDueGrossRounded)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.TotalLoansAndAdvances)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.TotalNetSalary)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.Notes)
            .HasMaxLength(500);

        builder.Property(x => x.ApprovedBy)
            .HasMaxLength(256);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(256);

        builder.HasIndex(x => new { x.MonthYear, x.DepartmentCategory });
    }
}

