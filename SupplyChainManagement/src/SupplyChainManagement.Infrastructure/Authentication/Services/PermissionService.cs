using Microsoft.EntityFrameworkCore;
using SupplyChainManagement.Application.Authentication.Interfaces;
using SupplyChainManagement.Infrastructure.Persistence;

namespace SupplyChainManagement.Infrastructure.Authentication.Services;

public sealed class PermissionService : IPermissionService
{
    private readonly AppDbContext _context;

    public PermissionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IList<string>> GetUserPermissionsAsync(Guid userId)
    {
        var roleIds = await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Select(ur => ur.RoleId)
            .ToListAsync();

        var permissions = await _context.RolePermissions
            .Where(rp => roleIds.Contains(rp.RoleId))
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToListAsync();

        return permissions;
    }
}
