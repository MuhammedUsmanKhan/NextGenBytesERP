namespace NextGenBytes.ERP.Domain.Definitions;

public sealed class Sequence
{
    public Guid Id { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public long LastNumber { get; set; }
    public DateTime UpdatedAt { get; set; }
}
