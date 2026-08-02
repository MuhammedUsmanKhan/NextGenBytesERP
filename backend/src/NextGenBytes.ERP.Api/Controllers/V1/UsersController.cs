using Microsoft.AspNetCore.Mvc;
using NextGenBytes.ERP.Api.Authorization;
using NextGenBytes.ERP.Application.RoleManagement.DTOs;
using NextGenBytes.ERP.Application.RoleManagement.Interfaces;

namespace NextGenBytes.ERP.Api.Controllers.V1;

[ApiController]
[Route("api/v1/users")]
[RequirePermission("Roles.Manage")]
public sealed class UsersController : ControllerBase
{
    private readonly IRoleManagementService _roleManagementService;

    public UsersController(IRoleManagementService roleManagementService)
    {
        _roleManagementService = roleManagementService;
    }

    [HttpGet]
    [EndpointSummary("List all users with their roles")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll()
    {
        var users = await _roleManagementService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("{userId:guid}/roles")]
    [EndpointSummary("Get all roles assigned to a user")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserRoles(Guid userId)
    {
        var roles = await _roleManagementService.GetUserRolesAsync(userId);
        return Ok(roles);
    }

    [HttpPost("{userId:guid}/roles")]
    [EndpointSummary("Assign roles to a user")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignRoles(
        Guid userId,
        [FromBody] AssignRolesRequest request)
    {
        await _roleManagementService.AssignRolesToUserAsync(userId, request);
        return NoContent();
    }

    [HttpDelete("{userId:guid}/roles/{roleId:guid}")]
    [EndpointSummary("Remove a role from a user")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveRole(Guid userId, Guid roleId)
    {
        await _roleManagementService.RemoveRoleFromUserAsync(userId, roleId);
        return NoContent();
    }
}
