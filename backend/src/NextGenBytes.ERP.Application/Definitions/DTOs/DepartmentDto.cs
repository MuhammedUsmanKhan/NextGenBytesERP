using System.ComponentModel.DataAnnotations;
using NextGenBytes.ERP.Domain.Definitions;

namespace NextGenBytes.ERP.Application.Definitions.DTOs;

public sealed record DepartmentResponse(
    Guid Id,
    string Code,
    string Name,
    string Status,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public sealed record CreateDepartmentRequest(
    [Required][MaxLength(256)] string Name,
    [Required][MaxLength(20)] string Status);

public sealed record UpdateDepartmentRequest(
    [Required][MaxLength(256)] string Name,
    [Required][MaxLength(20)] string Status);

public static class DepartmentMappings
{
    public static DepartmentResponse ToResponse(this Department entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.Status,
        entity.CreatedAt,
        entity.CreatedBy,
        entity.UpdatedAt,
        entity.UpdatedBy);
}
