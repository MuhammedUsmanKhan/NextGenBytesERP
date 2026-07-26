using System.ComponentModel.DataAnnotations;
using SupplyChainManagement.Domain.Products;

namespace SupplyChainManagement.Application.Products.DTOs;

public sealed record ProductResponse(
    Guid Id,
    string ProductCode,
    string Name,
    Guid ProductTypeId,
    string ProductTypeName,
    Guid CategoryId,
    string CategoryName,
    Guid? SubCategoryId,
    string? SubCategoryName,
    Guid? BrandId,
    string? BrandName,
    Guid? ProductGroupId,
    string? ProductGroupName,
    Guid UnitId,
    string UnitName,
    decimal? Weight,
    decimal? ThicknessGSM,
    string? ColorScheme,
    string Status,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public sealed record CreateProductRequest(
    [Required][MaxLength(200)] string Name,
    [Required] Guid ProductTypeId,
    [Required] Guid CategoryId,
    Guid? SubCategoryId,
    Guid? BrandId,
    Guid? ProductGroupId,
    [Required] Guid UnitId,
    decimal? Weight,
    decimal? ThicknessGSM,
    [MaxLength(100)] string? ColorScheme,
    [Required][MaxLength(20)] string Status);

public sealed record NextProductCodeResponse(
    Guid ProductTypeId,
    string ProductCode);

public sealed record UpdateProductRequest(
    [Required][MaxLength(200)] string Name,
    [Required] Guid ProductTypeId,
    [Required] Guid CategoryId,
    Guid? SubCategoryId,
    Guid? BrandId,
    Guid? ProductGroupId,
    [Required] Guid UnitId,
    decimal? Weight,
    decimal? ThicknessGSM,
    [MaxLength(100)] string? ColorScheme,
    [Required][MaxLength(20)] string Status);

public static class ProductMappings
{
    public static ProductResponse ToResponse(this Product entity) => new(
        entity.Id,
        entity.ProductCode,
        entity.Name,
        entity.ProductTypeId,
        entity.ProductType?.Name ?? string.Empty,
        entity.CategoryId,
        entity.Category?.Name ?? string.Empty,
        entity.SubCategoryId,
        entity.SubCategory?.Name,
        entity.BrandId,
        entity.Brand?.Name,
        entity.ProductGroupId,
        entity.ProductGroup?.Name,
        entity.UnitId,
        entity.Unit?.Name ?? string.Empty,
        entity.Weight,
        entity.ThicknessGSM,
        entity.ColorScheme,
        entity.Status,
        entity.CreatedAt,
        entity.CreatedBy,
        entity.UpdatedAt,
        entity.UpdatedBy);
}
