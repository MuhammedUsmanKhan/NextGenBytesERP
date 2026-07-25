using System.ComponentModel.DataAnnotations;
using SupplyChainManagement.Domain.Definitions;

namespace SupplyChainManagement.Application.Definitions.DTOs;

public sealed record ProductTypeResponse(
    Guid Id,
    string Code,
    string Name,
    int CodePrefix,
    string Status,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public sealed record CreateProductTypeRequest(
    [Required][MaxLength(50)] string Code,
    [Required][MaxLength(256)] string Name,
    [Required] int CodePrefix,
    [Required][MaxLength(20)] string Status);

public sealed record UpdateProductTypeRequest(
    [Required][MaxLength(50)] string Code,
    [Required][MaxLength(256)] string Name,
    [Required][MaxLength(20)] string Status);

public static class ProductTypeMappings
{
    public static ProductTypeResponse ToResponse(this ProductType entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.CodePrefix,
        entity.Status,
        entity.CreatedAt,
        entity.CreatedBy,
        entity.UpdatedAt,
        entity.UpdatedBy);
}
