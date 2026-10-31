using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Configurations.Payroll;

public sealed class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("Employees");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.FullName)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.BiometricDeviceId)
            .HasMaxLength(50);

        builder.Property(x => x.CNIC)
            .HasMaxLength(20);

        builder.Property(x => x.Phone)
            .HasMaxLength(20);

        builder.Property(x => x.Designation)
            .HasMaxLength(100);

        builder.Property(x => x.Category)
            .HasMaxLength(50)
            .IsRequired()
            .HasDefaultValue("Salaries Labor");

        builder.Property(x => x.Status)
            .HasMaxLength(20)
            .IsRequired()
            .HasDefaultValue("Active");

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(256);

        builder.HasIndex(x => x.Code).IsUnique();

        builder.HasIndex(x => x.BiometricDeviceId)
            .IsUnique()
            .HasFilter("[BiometricDeviceId] IS NOT NULL AND [IsDeleted] = 0");

        builder.HasOne(x => x.Department)
            .WithMany()
            .HasForeignKey(x => x.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.ShiftDefinition)
            .WithMany(s => s.Employees)
            .HasForeignKey(x => x.ShiftDefinitionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

