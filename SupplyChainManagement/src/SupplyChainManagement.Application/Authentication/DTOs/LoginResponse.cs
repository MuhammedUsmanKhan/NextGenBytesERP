namespace SupplyChainManagement.Application.Authentication.DTOs;

public sealed record LoginResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt);
