namespace NextGenBytes.ERP.Application.RoleManagement.DTOs;

public sealed record AssignPermissionsRequest(List<Guid> PermissionIds);
