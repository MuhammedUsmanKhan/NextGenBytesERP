namespace NextGenBytes.ERP.Application.Authentication.DTOs;

public sealed record RefreshResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt);
