using Microsoft.AspNetCore.Mvc;
using NextGenBytes.ERP.Api.Authorization;
using NextGenBytes.ERP.Application.RoleManagement.DTOs;
using NextGenBytes.ERP.Application.RoleManagement.Interfaces;

namespace NextGenBytes.ERP.Api.Controllers.V1;

[ApiController]
[Route("api/v1/roles")]
[RequirePermission("Roles.Manage")]
public sealed class RolesController : ControllerBase
{
    private readonly IRoleManagementService _roleManagementService;

    public RolesController(IRoleManagementService roleManagementService)
    {
        _roleManagementService = roleManagementService;
    }

    [HttpGet]
    [EndpointSummary("List all roles with their permissions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll()
    {
        var roles = await _roleManagementService.GetAllRolesAsync();
        return Ok(roles);
    }

    [HttpPost]
    [EndpointSummary("Create a new role")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateRoleRequest request)
    {
        var role = await _roleManagementService.CreateRoleAsync(request);
        return CreatedAtAction(nameof(GetAll), new { id = role.Id }, role);
    }

    [HttpPost("{roleId:guid}/permissions")]
    [EndpointSummary("Assign permissions to a role")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignPermissions(
        Guid roleId,
        [FromBody] AssignPermissionsRequest request)
    {
        await _roleManagementService.AssignPermissionsToRoleAsync(roleId, request);
        return NoContent();
    }

    [HttpDelete("{roleId:guid}/permissions/{permissionId:guid}")]
    [EndpointSummary("Remove a permission from a role")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemovePermission(Guid roleId, Guid permissionId)
    {
        await _roleManagementService.RemovePermissionFromRoleAsync(roleId, permissionId);
        return NoContent();
    }
}
