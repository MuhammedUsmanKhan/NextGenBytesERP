using NextGenBytes.ERP.Domain.Authentication;

namespace NextGenBytes.ERP.Application.Authentication.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(Guid userId, string email, IList<string> roles, IList<string> permissions);
    string GenerateRefreshToken();
    string HashRefreshToken(string token);
    Task<RefreshToken?> ValidateRefreshTokenAsync(string tokenHash, Guid userId);
    Task RotateRefreshTokenAsync(RefreshToken oldToken, string newTokenHash, Guid newTokenId);
    Task RevokeTokenFamilyAsync(Guid tokenId);
}
