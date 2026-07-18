using Microsoft.AspNetCore.Authorization;

namespace SupplyChainManagement.Api.Authorization;

public sealed class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var permissions = context.User.Claims
            .Where(c => c.Type == "permission")
            .Select(c => c.Value);

        if (permissions.Contains(requirement.PermissionName))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
