namespace NextGenBytes.ERP.Application.RoleManagement.DTOs;

public sealed record RoleDto(Guid Id, string Name, string? Description, List<string> Permissions);
