using System.ComponentModel.DataAnnotations;
using NextGenBytes.ERP.Domain.Definitions;

namespace NextGenBytes.ERP.Application.Definitions.DTOs;

public sealed record WarehouseResponse(
    Guid Id,
    string Code,
    string Name,
    string? Location,
    string Status,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public sealed record CreateWarehouseRequest(
    [Required][MaxLength(256)] string Name,
    [MaxLength(512)] string? Location,
    [Required][MaxLength(20)] string Status);

public sealed record UpdateWarehouseRequest(
    [Required][MaxLength(256)] string Name,
    [MaxLength(512)] string? Location,
    [Required][MaxLength(20)] string Status);

public static class WarehouseMappings
{
    public static WarehouseResponse ToResponse(this Warehouse entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.Location,
        entity.Status,
        entity.CreatedAt,
        entity.CreatedBy,
        entity.UpdatedAt,
        entity.UpdatedBy);
}
