namespace SupplyChainManagement.Domain.Definitions;

public sealed class ProductTypeSequence
{
    public Guid Id { get; set; }
    public Guid ProductTypeId { get; set; }
    public int LastNumber { get; set; }
    public DateTime UpdatedAt { get; set; }
}
