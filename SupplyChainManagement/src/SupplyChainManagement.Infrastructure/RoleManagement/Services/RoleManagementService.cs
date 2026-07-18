using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SupplyChainManagement.Application.RoleManagement.DTOs;
using SupplyChainManagement.Application.RoleManagement.Interfaces;
using SupplyChainManagement.Domain.Authentication;
using SupplyChainManagement.Infrastructure.Identity;
using SupplyChainManagement.Infrastructure.Persistence;

namespace SupplyChainManagement.Infrastructure.RoleManagement.Services;

public sealed class RoleManagementService : IRoleManagementService
{
    private readonly AppDbContext _context;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public RoleManagementService(
        AppDbContext context,
        RoleManager<ApplicationRole> roleManager,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _roleManager = roleManager;
        _userManager = userManager;
    }

    public async Task<List<PermissionDto>> GetAllPermissionsAsync()
    {
        return await _context.Permissions
            .AsNoTracking()
            .OrderBy(p => p.Name)
            .Select(p => new PermissionDto(p.Id, p.Name, p.Description))
            .ToListAsync();
    }

    public async Task<List<RoleDto>> GetAllRolesAsync()
    {
        var roles = await _context.Roles
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .ToListAsync();

        var roleDtos = new List<RoleDto>();

        foreach (var role in roles)
        {
            var permissionNames = await _context.RolePermissions
                .AsNoTracking()
                .Where(rp => rp.RoleId == role.Id)
                .Select(rp => rp.Permission.Name)
                .ToListAsync();

            roleDtos.Add(new RoleDto(role.Id, role.Name!, role.Description, permissionNames));
        }

        return roleDtos;
    }

    public async Task<RoleDto> CreateRoleAsync(CreateRoleRequest request)
    {
        var roleExists = await _roleManager.RoleExistsAsync(request.Name);
        if (roleExists)
        {
            throw new InvalidOperationException($"Role '{request.Name}' already exists.");
        }

        var role = new ApplicationRole
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            NormalizedName = request.Name.ToUpperInvariant(),
            Description = request.Description
        };

        var result = await _roleManager.CreateAsync(role);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create role: {errors}");
        }

        return new RoleDto(role.Id, role.Name!, role.Description, []);
    }

    public async Task AssignPermissionsToRoleAsync(Guid roleId, AssignPermissionsRequest request)
    {
        var role = await _roleManager.FindByIdAsync(roleId.ToString());
        if (role is null)
        {
            throw new KeyNotFoundException($"Role with ID '{roleId}' not found.");
        }

        var existingPermissions = await _context.RolePermissions
            .Where(rp => rp.RoleId == roleId)
            .Select(rp => rp.PermissionId)
            .ToListAsync();

        var newPermissions = request.PermissionIds
            .Where(pid => !existingPermissions.Contains(pid))
            .Select(pid => new RolePermission(roleId, pid))
            .ToList();

        if (newPermissions.Count != 0)
        {
            _context.RolePermissions.AddRange(newPermissions);
            await _context.SaveChangesAsync();
        }
    }

    public async Task RemovePermissionFromRoleAsync(Guid roleId, Guid permissionId)
    {
        var rolePermission = await _context.RolePermissions
            .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

        if (rolePermission is null)
        {
            throw new KeyNotFoundException("Permission assignment not found.");
        }

        _context.RolePermissions.Remove(rolePermission);
        await _context.SaveChangesAsync();
    }

    public async Task AssignRolesToUserAsync(Guid userId, AssignRolesRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            throw new KeyNotFoundException($"User with ID '{userId}' not found.");
        }

        var currentRoles = await _userManager.GetRolesAsync(user);
        var rolesToAdd = new List<string>();

        foreach (var roleId in request.RoleIds)
        {
            var role = await _roleManager.FindByIdAsync(roleId.ToString());
            if (role is null)
            {
                throw new KeyNotFoundException($"Role with ID '{roleId}' not found.");
            }

            if (!currentRoles.Contains(role.Name!))
            {
                rolesToAdd.Add(role.Name!);
            }
        }

        if (rolesToAdd.Count != 0)
        {
            var result = await _userManager.AddToRolesAsync(user, rolesToAdd);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to assign roles: {errors}");
            }
        }
    }

    public async Task RemoveRoleFromUserAsync(Guid userId, Guid roleId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            throw new KeyNotFoundException($"User with ID '{userId}' not found.");
        }

        var role = await _roleManager.FindByIdAsync(roleId.ToString());
        if (role is null)
        {
            throw new KeyNotFoundException($"Role with ID '{roleId}' not found.");
        }

        var result = await _userManager.RemoveFromRoleAsync(user, role.Name!);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to remove role: {errors}");
        }
    }

    public async Task<List<RoleDto>> GetUserRolesAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            throw new KeyNotFoundException($"User with ID '{userId}' not found.");
        }

        var roleNames = await _userManager.GetRolesAsync(user);
        var roles = await _context.Roles
            .AsNoTracking()
            .Where(r => roleNames.Contains(r.Name!))
            .ToListAsync();

        var roleDtos = new List<RoleDto>();
        foreach (var role in roles)
        {
            var permissionNames = await _context.RolePermissions
                .AsNoTracking()
                .Where(rp => rp.RoleId == role.Id)
                .Select(rp => rp.Permission.Name)
                .ToListAsync();

            roleDtos.Add(new RoleDto(role.Id, role.Name!, role.Description, permissionNames));
        }

        return roleDtos;
    }
}
