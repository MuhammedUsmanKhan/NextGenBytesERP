using System.ComponentModel.DataAnnotations;
using SupplyChainManagement.Domain.Definitions;

namespace SupplyChainManagement.Application.Definitions.DTOs;

public sealed record ProductGroupResponse(
    Guid Id,
    string Code,
    string Name,
    string Status,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public sealed record CreateProductGroupRequest(
    [Required][MaxLength(50)] string Code,
    [Required][MaxLength(256)] string Name,
    [Required][MaxLength(20)] string Status);

public sealed record UpdateProductGroupRequest(
    [Required][MaxLength(50)] string Code,
    [Required][MaxLength(256)] string Name,
    [Required][MaxLength(20)] string Status);

public static class ProductGroupMappings
{
    public static ProductGroupResponse ToResponse(this ProductGroup entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.Status,
        entity.CreatedAt,
        entity.CreatedBy,
        entity.UpdatedAt,
        entity.UpdatedBy);
}
