using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SupplyChainManagement.Application.Authentication.Interfaces;
using SupplyChainManagement.Infrastructure.Authentication.Services;
using SupplyChainManagement.Infrastructure.Common;
using SupplyChainManagement.Infrastructure.Identity;
using SupplyChainManagement.Application.RoleManagement.Interfaces;
using SupplyChainManagement.Application.Definitions.Interfaces;
using SupplyChainManagement.Application.Products.Interfaces;
using SupplyChainManagement.Application.Inventory.Interfaces;
using SupplyChainManagement.Infrastructure.Definitions.Services;
using SupplyChainManagement.Infrastructure.Inventory.Services;
using SupplyChainManagement.Infrastructure.Persistence;
using SupplyChainManagement.Infrastructure.Products.Services;
using SupplyChainManagement.Infrastructure.RoleManagement.Services;

namespace SupplyChainManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<AppDbContext>(options =>
        {
            if (configuration.GetValue<bool>("UseInMemoryDatabase"))
                options.UseInMemoryDatabase("AppDb");
            else
                options.UseSqlServer(connectionString);
        });

        services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequiredLength = 8;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

        services.Configure<JwtSettings>(
            configuration.GetSection(JwtSettings.SectionName));

        services.AddHttpContextAccessor();

        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPermissionService, PermissionService>();
        services.AddScoped<IRoleManagementService, RoleManagementService>();
        services.AddScoped<IDefinitionsService, DefinitionsService>();
        services.AddScoped<IProductTypeService, ProductTypeService>();
        services.AddScoped<IUnitService, UnitService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IInventoryService, InventoryService>();

        return services;
    }
}
