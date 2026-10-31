using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations.Payroll;

public sealed class PayslipConfiguration : IEntityTypeConfiguration<Payslip>
{
    public void Configure(EntityTypeBuilder<Payslip> builder)
    {
        builder.ToTable("Payslips");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.EmployeeNameSnapshot)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.DepartmentSnapshot)
            .HasMaxLength(100)
            .IsRequired();

        // Financial decimals
        builder.Property(x => x.BasicRate).HasPrecision(18, 2);
        builder.Property(x => x.AttendanceAllowance).HasPrecision(18, 2);
        builder.Property(x => x.OtherAllowances).HasPrecision(18, 2);
        builder.Property(x => x.GrossSalary).HasPrecision(18, 2);
        builder.Property(x => x.AbsentDeduction).HasPrecision(18, 2);
        builder.Property(x => x.LateDeduction).HasPrecision(18, 2);
        builder.Property(x => x.NightShiftAmount).HasPrecision(18, 2);
        builder.Property(x => x.OvertimeAmount).HasPrecision(18, 2);
        builder.Property(x => x.TotalDeductions).HasPrecision(18, 2);
        builder.Property(x => x.DueGrossSalary).HasPrecision(18, 2);
        builder.Property(x => x.DueGrossSalaryRounded).HasPrecision(18, 2);
        builder.Property(x => x.LoanDeduction).HasPrecision(18, 2);
        builder.Property(x => x.AdvanceSalaryDeduction).HasPrecision(18, 2);
        builder.Property(x => x.TotalLess).HasPrecision(18, 2);
        builder.Property(x => x.NetSalary).HasPrecision(18, 2);

        // Attendance quantities
        builder.Property(x => x.DaysPresent).HasPrecision(5, 2);
        builder.Property(x => x.AbsentDays).HasPrecision(5, 2);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(256);

        builder.HasOne(x => x.PayrollRun)
            .WithMany(r => r.Payslips)
            .HasForeignKey(x => x.PayrollRunId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Employee)
            .WithMany(e => e.Payslips)
            .HasForeignKey(x => x.EmployeeId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Denomination)
            .WithOne(d => d.Payslip)
            .HasForeignKey<PayslipDenomination>(d => d.PayslipId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.PayrollRunId, x.EmployeeId }).IsUnique();
    }
}
