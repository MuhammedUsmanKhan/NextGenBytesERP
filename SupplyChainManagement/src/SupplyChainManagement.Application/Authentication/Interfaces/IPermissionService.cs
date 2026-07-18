namespace SupplyChainManagement.Application.Authentication.Interfaces;

public interface IPermissionService
{
    Task<IList<string>> GetUserPermissionsAsync(Guid userId);
}
