namespace NextGenBytes.ERP.Application.Authentication.DTOs;

public sealed record LoginResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt);
