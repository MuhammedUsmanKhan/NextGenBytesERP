using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Infrastructure.Identity;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Api;

public static class DbInitializer
{
    public static async Task SeedDevelopmentDataAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await context.Database.MigrateAsync();

        if (!await context.Sequences.AnyAsync(s => s.EntityName == "Product"))
        {
            context.ProductTypes.AddRange(
                new ProductType { Id = Guid.Parse("a1b2c3d4-0001-0000-0000-000000000001"), Code = "RAW", Name = "Raw Material", CodePrefix = 1000000, Status = "Active", CreatedBy = "system", CreatedAt = DateTime.UtcNow },
                new ProductType { Id = Guid.Parse("a1b2c3d4-0001-0000-0000-000000000002"), Code = "FIN", Name = "Finished Goods", CodePrefix = 2000000, Status = "Active", CreatedBy = "system", CreatedAt = DateTime.UtcNow },
                new ProductType { Id = Guid.Parse("a1b2c3d4-0001-0000-0000-000000000003"), Code = "SEMI", Name = "Semi Finished", CodePrefix = 3000000, Status = "Active", CreatedBy = "system", CreatedAt = DateTime.UtcNow },
                new ProductType { Id = Guid.Parse("a1b2c3d4-0001-0000-0000-000000000004"), Code = "PACK", Name = "Packing Material", CodePrefix = 4000000, Status = "Active", CreatedBy = "system", CreatedAt = DateTime.UtcNow }
            );

            context.Units.AddRange(
                new Unit { Id = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000001"), Code = "PCS", Name = "Piece", ShortName = "PCS", DecimalPlaces = 0, Status = "Active", CreatedBy = "system", CreatedAt = DateTime.UtcNow },
                new Unit { Id = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000002"), Code = "KG", Name = "Kilogram", ShortName = "KG", DecimalPlaces = 3, Status = "Active", CreatedBy = "system", CreatedAt = DateTime.UtcNow },
                new Unit { Id = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000003"), Code = "LTR", Name = "Litre", ShortName = "LTR", DecimalPlaces = 3, Status = "Active", CreatedBy = "system", CreatedAt = DateTime.UtcNow },
                new Unit { Id = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000004"), Code = "MTR", Name = "Metre", ShortName = "MTR", DecimalPlaces = 2, Status = "Active", CreatedBy = "system", CreatedAt = DateTime.UtcNow },
                new Unit { Id = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000005"), Code = "BOX", Name = "Box", ShortName = "BOX", DecimalPlaces = 0, Status = "Active", CreatedBy = "system", CreatedAt = DateTime.UtcNow },
                new Unit { Id = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000006"), Code = "GM", Name = "Gram", ShortName = "GM", DecimalPlaces = 3, Status = "Active", CreatedBy = "system", CreatedAt = DateTime.UtcNow },
                new Unit { Id = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000007"), Code = "TON", Name = "Ton", ShortName = "TON", DecimalPlaces = 3, Status = "Active", CreatedBy = "system", CreatedAt = DateTime.UtcNow }
            );

            context.Sequences.AddRange(
                new Sequence { Id = Guid.Parse("d4e5f6a7-0004-0000-0000-000000000001"), EntityName = "Product", Scope = "RAW", LastNumber = 0, UpdatedAt = DateTime.UtcNow },
                new Sequence { Id = Guid.Parse("d4e5f6a7-0004-0000-0000-000000000002"), EntityName = "Product", Scope = "FIN", LastNumber = 0, UpdatedAt = DateTime.UtcNow },
                new Sequence { Id = Guid.Parse("d4e5f6a7-0004-0000-0000-000000000003"), EntityName = "Product", Scope = "SEMI", LastNumber = 0, UpdatedAt = DateTime.UtcNow },
                new Sequence { Id = Guid.Parse("d4e5f6a7-0004-0000-0000-000000000004"), EntityName = "Product", Scope = "PACK", LastNumber = 0, UpdatedAt = DateTime.UtcNow },
                new Sequence { Id = Guid.Parse("d4e5f6a7-0004-0000-0000-000000000005"), EntityName = "Vendor", Scope = "DEFAULT", LastNumber = 0, UpdatedAt = DateTime.UtcNow },
                new Sequence { Id = Guid.Parse("d4e5f6a7-0004-0000-0000-000000000006"), EntityName = "MainCategory", Scope = "DEFAULT", LastNumber = 0, UpdatedAt = DateTime.UtcNow },
                new Sequence { Id = Guid.Parse("d4e5f6a7-0004-0000-0000-000000000007"), EntityName = "SubCategory", Scope = "DEFAULT", LastNumber = 0, UpdatedAt = DateTime.UtcNow },
                new Sequence { Id = Guid.Parse("d4e5f6a7-0004-0000-0000-000000000008"), EntityName = "Brand", Scope = "DEFAULT", LastNumber = 0, UpdatedAt = DateTime.UtcNow },
                new Sequence { Id = Guid.Parse("d4e5f6a7-0004-0000-0000-000000000009"), EntityName = "Warehouse", Scope = "DEFAULT", LastNumber = 0, UpdatedAt = DateTime.UtcNow },
                new Sequence { Id = Guid.Parse("d4e5f6a7-0004-0000-0000-000000000010"), EntityName = "Transporter", Scope = "DEFAULT", LastNumber = 0, UpdatedAt = DateTime.UtcNow },
                new Sequence { Id = Guid.Parse("d4e5f6a7-0004-0000-0000-000000000011"), EntityName = "ProductGroup", Scope = "DEFAULT", LastNumber = 0, UpdatedAt = DateTime.UtcNow }
            );

            await context.SaveChangesAsync();
        }

        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();

        if (!await userManager.Users.AnyAsync(u => u.Email == "admin@example.com"))
        {
            var adminUser = new ApplicationUser
            {
                UserName = "admin@example.com",
                Email = "admin@example.com",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(adminUser, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }
}
