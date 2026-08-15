using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NextGenBytes.ERP.Application.Authentication.Interfaces;
using NextGenBytes.ERP.Infrastructure.Authentication.Services;
using NextGenBytes.ERP.Infrastructure.Common;
using NextGenBytes.ERP.Infrastructure.Identity;
using NextGenBytes.ERP.Application.RoleManagement.Interfaces;
using NextGenBytes.ERP.Application.Common.Interfaces;
using NextGenBytes.ERP.Application.Definitions.Interfaces;
using NextGenBytes.ERP.Application.Products.Interfaces;
using NextGenBytes.ERP.Application.Inventory.Interfaces;
using NextGenBytes.ERP.Infrastructure.Definitions.Services;
using NextGenBytes.ERP.Infrastructure.Inventory.Services;
using NextGenBytes.ERP.Infrastructure.Persistence;
using NextGenBytes.ERP.Infrastructure.Products.Services;
using NextGenBytes.ERP.Infrastructure.RoleManagement.Services;
using NextGenBytes.ERP.Infrastructure.Services;

namespace NextGenBytes.ERP.Infrastructure;

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
        services.AddScoped<IMainCategoryService, MainCategoryService>();
        services.AddScoped<ISubCategoryService, SubCategoryService>();
        services.AddScoped<IBrandService, BrandService>();
        services.AddScoped<IWarehouseService, WarehouseService>();
        services.AddScoped<IProductGroupService, ProductGroupService>();
        services.AddScoped<ITransporterService, TransporterService>();
        services.AddScoped<IProductTypeService, ProductTypeService>();
        services.AddScoped<IUnitService, UnitService>();
        services.AddScoped<IVendorService, VendorService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ISequenceService, SequenceService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IInventoryService, InventoryService>();

        return services;
    }
}
