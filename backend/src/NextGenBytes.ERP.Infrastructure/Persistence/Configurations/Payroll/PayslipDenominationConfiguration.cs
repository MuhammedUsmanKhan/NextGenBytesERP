using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations.Payroll;

public sealed class PayslipDenominationConfiguration : IEntityTypeConfiguration<PayslipDenomination>
{
    public void Configure(EntityTypeBuilder<PayslipDenomination> builder)
    {
        builder.ToTable("PayslipDenominations");

        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Payslip)
            .WithOne(p => p.Denomination)
            .HasForeignKey<PayslipDenomination>(x => x.PayslipId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.PayslipId).IsUnique();
    }
}

