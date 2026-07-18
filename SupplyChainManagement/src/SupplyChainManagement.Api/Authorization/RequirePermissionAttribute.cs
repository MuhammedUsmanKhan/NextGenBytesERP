using Microsoft.AspNetCore.Authorization;

namespace SupplyChainManagement.Api.Authorization;

public sealed class RequirePermissionAttribute : AuthorizeAttribute
{
    public const string PolicyPrefix = "Permission:";

    public RequirePermissionAttribute(string permissionName)
    {
        Policy = $"{PolicyPrefix}{permissionName}";
    }
}
