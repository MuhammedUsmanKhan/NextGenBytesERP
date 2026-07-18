using Microsoft.AspNetCore.Identity;

namespace SupplyChainManagement.Infrastructure.Identity;

public sealed class ApplicationRole : IdentityRole<Guid>
{
    public string? Description { get; set; }
}
