using Microsoft.AspNetCore.Authorization;

namespace SupplyChainManagement.Api.Authorization;

public sealed class PermissionRequirement : IAuthorizationRequirement
{
    public string PermissionName { get; }

    public PermissionRequirement(string permissionName)
    {
        PermissionName = permissionName ?? throw new ArgumentNullException(nameof(permissionName));
    }
}
