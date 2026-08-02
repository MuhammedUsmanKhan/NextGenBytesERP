using System.ComponentModel.DataAnnotations;
using NextGenBytes.ERP.Domain.Definitions;

namespace NextGenBytes.ERP.Application.Definitions.DTOs;

public sealed record BrandResponse(
    Guid Id,
    string Code,
    string Name,
    string Status,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public sealed record CreateBrandRequest(
    [Required][MaxLength(256)] string Name,
    [Required][MaxLength(20)] string Status);

public sealed record UpdateBrandRequest(
    [Required][MaxLength(256)] string Name,
    [Required][MaxLength(20)] string Status);

public static class BrandMappings
{
    public static BrandResponse ToResponse(this Brand entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.Status,
        entity.CreatedAt,
        entity.CreatedBy,
        entity.UpdatedAt,
        entity.UpdatedBy);
}
