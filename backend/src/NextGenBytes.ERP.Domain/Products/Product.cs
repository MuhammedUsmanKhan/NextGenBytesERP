using NextGenBytes.ERP.Domain.Definitions;

namespace NextGenBytes.ERP.Domain.Products;

public sealed class Product
{
    public Guid Id { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public Guid ProductTypeId { get; set; }
    public ProductType ProductType { get; set; } = null!;

    public Guid CategoryId { get; set; }
    public MainCategory Category { get; set; } = null!;

    public Guid? SubCategoryId { get; set; }
    public SubCategory? SubCategory { get; set; }

    public Guid? BrandId { get; set; }
    public Brand? Brand { get; set; }

    public Guid? ProductGroupId { get; set; }
    public ProductGroup? ProductGroup { get; set; }

    public Guid UnitId { get; set; }
    public Unit Unit { get; set; } = null!;

    public decimal? Weight { get; set; }
    public decimal? ThicknessGSM { get; set; }
    public string? ColorScheme { get; set; }

    public string Status { get; set; } = "Active";

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
