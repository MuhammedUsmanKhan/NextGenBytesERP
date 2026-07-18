using SupplyChainManagement.Application.RoleManagement.DTOs;

namespace SupplyChainManagement.Application.RoleManagement.Interfaces;

public interface IRoleManagementService
{
    Task<List<PermissionDto>> GetAllPermissionsAsync();
    Task<List<RoleDto>> GetAllRolesAsync();
    Task<RoleDto> CreateRoleAsync(CreateRoleRequest request);
    Task AssignPermissionsToRoleAsync(Guid roleId, AssignPermissionsRequest request);
    Task RemovePermissionFromRoleAsync(Guid roleId, Guid permissionId);
    Task AssignRolesToUserAsync(Guid userId, AssignRolesRequest request);
    Task RemoveRoleFromUserAsync(Guid userId, Guid roleId);
    Task<List<RoleDto>> GetUserRolesAsync(Guid userId);
    Task<List<UserDto>> GetAllUsersAsync();
}
