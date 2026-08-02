using NextGenBytes.ERP.Application.Authentication.DTOs;

namespace NextGenBytes.ERP.Application.Authentication.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, string? ipAddress, string? deviceInfo);
    Task<LoginResponse> RefreshAsync(string refreshToken, string? ipAddress, string? deviceInfo);
    Task LogoutAsync(Guid userId, string refreshToken);
    Task LogoutAllAsync(Guid userId);
}
