using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations.Payroll;

public sealed class LoanAndAdvanceConfiguration : IEntityTypeConfiguration<LoanAndAdvance>
{
    public void Configure(EntityTypeBuilder<LoanAndAdvance> builder)
    {
        builder.ToTable("LoansAndAdvances");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TotalAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.MonthlyDeduction)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.RemainingBalance)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Notes)
            .HasMaxLength(500);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(256);

        builder.HasOne(x => x.Employee)
            .WithMany(e => e.LoansAndAdvances)
            .HasForeignKey(x => x.EmployeeId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.EmployeeId, x.Status });
    }
}
