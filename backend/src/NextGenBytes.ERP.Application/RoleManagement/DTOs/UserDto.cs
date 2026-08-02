namespace NextGenBytes.ERP.Application.RoleManagement.DTOs;

public sealed record UserDto(Guid Id, string Email, List<string> Roles);
