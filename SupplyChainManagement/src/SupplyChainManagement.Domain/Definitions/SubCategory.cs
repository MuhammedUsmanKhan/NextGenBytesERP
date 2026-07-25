namespace SupplyChainManagement.Domain.Definitions;

public sealed class SubCategory
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public Guid MainCategoryId { get; set; }
    public MainCategory MainCategory { get; set; } = null!;

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
