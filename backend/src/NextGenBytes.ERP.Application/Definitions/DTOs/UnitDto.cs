using System.ComponentModel.DataAnnotations;
using NextGenBytes.ERP.Domain.Definitions;

namespace NextGenBytes.ERP.Application.Definitions.DTOs;

public sealed record UnitResponse(
    Guid Id,
    string Code,
    string Name,
    string ShortName,
    int DecimalPlaces,
    string Status,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public sealed record CreateUnitRequest(
    [Required][MaxLength(50)] string Code,
    [Required][MaxLength(256)] string Name,
    [Required][MaxLength(10)] string ShortName,
    [Required] int DecimalPlaces,
    [Required][MaxLength(20)] string Status);

public sealed record UpdateUnitRequest(
    [Required][MaxLength(50)] string Code,
    [Required][MaxLength(256)] string Name,
    [Required][MaxLength(10)] string ShortName,
    [Required] int DecimalPlaces,
    [Required][MaxLength(20)] string Status);

public static class UnitMappings
{
    public static UnitResponse ToResponse(this Unit entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.ShortName,
        entity.DecimalPlaces,
        entity.Status,
        entity.CreatedAt,
        entity.CreatedBy,
        entity.UpdatedAt,
        entity.UpdatedBy);
}
