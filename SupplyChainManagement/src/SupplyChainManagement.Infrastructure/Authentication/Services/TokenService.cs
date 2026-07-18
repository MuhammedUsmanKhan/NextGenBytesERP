using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SupplyChainManagement.Application.Authentication.Interfaces;
using SupplyChainManagement.Domain.Authentication;
using SupplyChainManagement.Infrastructure.Common;
using SupplyChainManagement.Infrastructure.Persistence;

namespace SupplyChainManagement.Infrastructure.Authentication.Services;

public sealed class TokenService : ITokenService
{
    private readonly AppDbContext _context;
    private readonly JwtSettings _jwtSettings;

    public TokenService(AppDbContext context, IOptions<JwtSettings> jwtSettings)
    {
        _context = context;
        _jwtSettings = jwtSettings.Value;
    }

    public string GenerateAccessToken(Guid userId, string email, IList<string> roles, IList<string> permissions)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        foreach (var permission in permissions)
        {
            claims.Add(new Claim("permission", permission));
        }

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public string HashRefreshToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }

    public async Task<RefreshToken?> ValidateRefreshTokenAsync(string tokenHash, Guid userId)
    {
        return await _context.RefreshTokens
            .Where(rt => rt.TokenHash == tokenHash && rt.UserId == userId)
            .FirstOrDefaultAsync();
    }

    public async Task RotateRefreshTokenAsync(RefreshToken oldToken, string newTokenHash, Guid newTokenId)
    {
        oldToken.MarkAsUsed(newTokenId);

        var newToken = new RefreshToken(
            newTokenId,
            oldToken.UserId,
            newTokenHash,
            oldToken.DeviceInfo,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays));

        await _context.RefreshTokens.AddAsync(newToken);
    }

    public async Task RevokeTokenFamilyAsync(Guid tokenId)
    {
        var token = await _context.RefreshTokens.FindAsync(tokenId);
        if (token is null) return;

        var tokensToRevoke = new List<RefreshToken> { token };

        var current = token;
        while (current.ReplacedByTokenId.HasValue)
        {
            var next = await _context.RefreshTokens.FindAsync(current.ReplacedByTokenId.Value);
            if (next is null) break;
            tokensToRevoke.Add(next);
            current = next;
        }

        current = token;
        var previous = await _context.RefreshTokens
            .Where(rt => rt.ReplacedByTokenId == current.Id)
            .ToListAsync();
        tokensToRevoke.AddRange(previous);

        foreach (var t in tokensToRevoke.Distinct())
        {
            t.Revoke(reason: "Theft detected — token family revoked");
        }
    }
}
