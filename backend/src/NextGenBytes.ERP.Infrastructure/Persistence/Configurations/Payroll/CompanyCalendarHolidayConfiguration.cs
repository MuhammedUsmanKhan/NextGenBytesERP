using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations.Payroll;

public sealed class CompanyCalendarHolidayConfiguration : IEntityTypeConfiguration<CompanyCalendarHoliday>
{
    public void Configure(EntityTypeBuilder<CompanyCalendarHoliday> builder)
    {
        builder.ToTable("CompanyCalendarHolidays");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.IsRecurringYearly)
            .HasDefaultValue(false);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(256);

        builder.HasIndex(x => x.Date);
    }
}

