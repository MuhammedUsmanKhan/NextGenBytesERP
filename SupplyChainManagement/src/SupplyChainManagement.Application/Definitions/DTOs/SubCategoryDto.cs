using System.ComponentModel.DataAnnotations;
using SupplyChainManagement.Domain.Definitions;

namespace SupplyChainManagement.Application.Definitions.DTOs;

public sealed record SubCategoryResponse(
    Guid Id,
    string Code,
    string Name,
    string Status,
    Guid MainCategoryId,
    string MainCategoryName,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public sealed record CreateSubCategoryRequest(
    [Required][MaxLength(50)] string Code,
    [Required][MaxLength(256)] string Name,
    [Required][MaxLength(20)] string Status,
    [Required] Guid MainCategoryId);

public sealed record UpdateSubCategoryRequest(
    [Required][MaxLength(50)] string Code,
    [Required][MaxLength(256)] string Name,
    [Required][MaxLength(20)] string Status,
    [Required] Guid MainCategoryId);

public static class SubCategoryMappings
{
    public static SubCategoryResponse ToResponse(this SubCategory entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.Status,
        entity.MainCategoryId,
        entity.MainCategory?.Name ?? string.Empty,
        entity.CreatedAt,
        entity.CreatedBy,
        entity.UpdatedAt,
        entity.UpdatedBy);
}
