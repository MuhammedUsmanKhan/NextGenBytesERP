using Microsoft.AspNetCore.Mvc;
using SupplyChainManagement.Api.Authorization;
using SupplyChainManagement.Application.RoleManagement.Interfaces;

namespace SupplyChainManagement.Api.Controllers.V1;

[ApiController]
[Route("api/v1/permissions")]
public sealed class PermissionsController : ControllerBase
{
    private readonly IRoleManagementService _roleManagementService;

    public PermissionsController(IRoleManagementService roleManagementService)
    {
        _roleManagementService = roleManagementService;
    }

    [HttpGet]
    [RequirePermission("Roles.Manage")]
    [EndpointSummary("List all permissions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll()
    {
        var permissions = await _roleManagementService.GetAllPermissionsAsync();
        return Ok(permissions);
    }
}
