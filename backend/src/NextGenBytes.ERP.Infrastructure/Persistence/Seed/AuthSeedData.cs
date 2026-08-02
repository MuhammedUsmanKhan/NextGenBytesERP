using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Domain.Authentication;
using NextGenBytes.ERP.Infrastructure.Identity;

namespace NextGenBytes.ERP.Infrastructure.Persistence.Seed;

public static class AuthSeedData
{
    public static readonly Guid AdminRoleId = Guid.Parse("A1B2C3D4-E5F6-7890-ABCD-EF1234567890");
    public static readonly Guid EditorRoleId = Guid.Parse("B2C3D4E5-F6A7-8901-BCDE-F12345678901");
    public static readonly Guid ViewerRoleId = Guid.Parse("C3D4E5F6-A7B8-9012-CDEF-123456789012");

    public static readonly Guid PermOrdersView = Guid.Parse("D4E5F6A7-B8C9-0123-DEF1-234567890123");
    public static readonly Guid PermOrdersEdit = Guid.Parse("E5F6A7B8-C9D0-1234-EF12-345678901234");
    public static readonly Guid PermOrdersDelete = Guid.Parse("F6A7B8C9-D0E1-2345-F123-456789012345");
    public static readonly Guid PermUsersView = Guid.Parse("A7B8C9D0-E1F2-3456-AB23-456789012345");
    public static readonly Guid PermUsersEdit = Guid.Parse("B8C9D0E1-F2A3-4567-BC34-567890123456");
    public static readonly Guid PermUsersDelete = Guid.Parse("C9D0E1F2-A3B4-5678-CD45-678901234567");
    public static readonly Guid PermRolesManage = Guid.Parse("D0E1F2A3-B4C5-6789-DE56-789012345678");
    public static readonly Guid PermDefinitionsView = Guid.Parse("E1F2A3B4-C5D6-7890-EF12-345678901234");
    public static readonly Guid PermDefinitionsEdit = Guid.Parse("F2A3B4C5-D6E7-8901-F123-456789012345");
    public static readonly Guid PermVendorView = Guid.Parse("A1B2C3D4-E5F6-7890-0000-000000000001");
    public static readonly Guid PermVendorCreate = Guid.Parse("A1B2C3D4-E5F6-7890-0000-000000000002");
    public static readonly Guid PermVendorUpdate = Guid.Parse("A1B2C3D4-E5F6-7890-0000-000000000003");
    public static readonly Guid PermVendorDelete = Guid.Parse("A1B2C3D4-E5F6-7890-0000-000000000004");

    public static IEnumerable<Permission> DefaultPermissions =>
    [
        new(PermOrdersView, "Orders.View", "View orders"),
        new(PermOrdersEdit, "Orders.Edit", "Edit orders"),
        new(PermOrdersDelete, "Orders.Delete", "Delete orders"),
        new(PermUsersView, "Users.View", "View users"),
        new(PermUsersEdit, "Users.Edit", "Edit users"),
        new(PermUsersDelete, "Users.Delete", "Delete users"),
        new(PermRolesManage, "Roles.Manage", "Manage roles and permissions"),
        new(PermDefinitionsView, "Definitions.View", "View definitions"),
        new(PermDefinitionsEdit, "Definitions.Edit", "Edit definitions"),
        new(PermVendorView, "Vendor.View", "View vendors"),
        new(PermVendorCreate, "Vendor.Create", "Create vendors"),
        new(PermVendorUpdate, "Vendor.Update", "Update vendors"),
        new(PermVendorDelete, "Vendor.Delete", "Delete vendors"),
    ];

    public static IEnumerable<ApplicationRole> DefaultRoles =>
    [
        new() { Id = AdminRoleId, Name = "Admin", NormalizedName = "ADMIN", Description = "Full system access", ConcurrencyStamp = "e727cd96-79be-4860-9ff8-c4fcb0e267f6" },
        new() { Id = EditorRoleId, Name = "Editor", NormalizedName = "EDITOR", Description = "Can view and edit records", ConcurrencyStamp = "0002ffa9-791c-4d5a-874c-450a380349e4" },
        new() { Id = ViewerRoleId, Name = "Viewer", NormalizedName = "VIEWER", Description = "Read-only access", ConcurrencyStamp = "8d31f82b-ad70-4602-a000-23e1e7f5d4f2" },
    ];

    public static IEnumerable<RolePermission> DefaultRolePermissions =>
    [
        // Admin — all permissions
        new(AdminRoleId, PermOrdersView),
        new(AdminRoleId, PermOrdersEdit),
        new(AdminRoleId, PermOrdersDelete),
        new(AdminRoleId, PermUsersView),
        new(AdminRoleId, PermUsersEdit),
        new(AdminRoleId, PermUsersDelete),
        new(AdminRoleId, PermRolesManage),
        new(AdminRoleId, PermDefinitionsView),
        new(AdminRoleId, PermDefinitionsEdit),
        new(AdminRoleId, PermVendorView),
        new(AdminRoleId, PermVendorCreate),
        new(AdminRoleId, PermVendorUpdate),
        new(AdminRoleId, PermVendorDelete),

        // Editor — view + edit
        new(EditorRoleId, PermOrdersView),
        new(EditorRoleId, PermOrdersEdit),
        new(EditorRoleId, PermUsersView),
        new(EditorRoleId, PermUsersEdit),
        new(EditorRoleId, PermDefinitionsView),
        new(EditorRoleId, PermDefinitionsEdit),
        new(EditorRoleId, PermVendorView),
        new(EditorRoleId, PermVendorCreate),
        new(EditorRoleId, PermVendorUpdate),

        // Viewer — view only
        new(ViewerRoleId, PermOrdersView),
        new(ViewerRoleId, PermUsersView),
        new(ViewerRoleId, PermDefinitionsView),
        new(ViewerRoleId, PermVendorView),
    ];

    public static void Seed(ModelBuilder builder)
    {
        builder.Entity<Permission>().HasData(DefaultPermissions);
        builder.Entity<ApplicationRole>().HasData(DefaultRoles);
        builder.Entity<RolePermission>().HasData(DefaultRolePermissions);
    }
}
