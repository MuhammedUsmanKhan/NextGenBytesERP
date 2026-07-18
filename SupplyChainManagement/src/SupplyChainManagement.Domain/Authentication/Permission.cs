namespace SupplyChainManagement.Domain.Authentication;

public sealed class Permission
{
    private Permission() { }

    public Permission(Guid id, string name, string? description)
    {
        Id = id;
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Description = description;
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }

    public ICollection<RolePermission> RolePermissions { get; private set; } = new List<RolePermission>();
}
