using System.ComponentModel.DataAnnotations;
using SupplyChainManagement.Domain.Definitions;

namespace SupplyChainManagement.Application.Definitions.DTOs;

public sealed record MainCategoryResponse(
    Guid Id,
    string Code,
    string Name,
    string Status,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public sealed record CreateMainCategoryRequest(
    [Required][MaxLength(50)] string Code,
    [Required][MaxLength(256)] string Name,
    [Required][MaxLength(20)] string Status);

public sealed record UpdateMainCategoryRequest(
    [Required][MaxLength(50)] string Code,
    [Required][MaxLength(256)] string Name,
    [Required][MaxLength(20)] string Status);

public static class MainCategoryMappings
{
    public static MainCategoryResponse ToResponse(this MainCategory entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.Status,
        entity.CreatedAt,
        entity.CreatedBy,
        entity.UpdatedAt,
        entity.UpdatedBy);
}
