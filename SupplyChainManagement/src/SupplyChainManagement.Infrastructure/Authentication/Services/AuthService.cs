using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SupplyChainManagement.Application.Authentication.DTOs;
using SupplyChainManagement.Application.Authentication.Interfaces;
using SupplyChainManagement.Domain.Authentication;
using SupplyChainManagement.Infrastructure.Identity;
using SupplyChainManagement.Infrastructure.Persistence;

namespace SupplyChainManagement.Infrastructure.Authentication.Services;

public sealed class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IPermissionService _permissionService;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        AppDbContext context,
        ITokenService tokenService,
        IPermissionService permissionService)
    {
        _userManager = userManager;
        _context = context;
        _tokenService = tokenService;
        _permissionService = permissionService;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, string? ipAddress, string? deviceInfo)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var permissions = await _permissionService.GetUserPermissionsAsync(user.Id);

        var accessToken = _tokenService.GenerateAccessToken(
            user.Id, user.Email!, roles, permissions);

        var rawRefreshToken = _tokenService.GenerateRefreshToken();
        var tokenHash = _tokenService.HashRefreshToken(rawRefreshToken);

        var refreshToken = new RefreshToken(
            Guid.NewGuid(),
            user.Id,
            tokenHash,
            deviceInfo,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(7));

        refreshToken.SetCreatedByIp(ipAddress);

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return new LoginResponse(
            accessToken,
            rawRefreshToken,
            DateTime.UtcNow.AddMinutes(15));
    }

    public async Task<LoginResponse> RefreshAsync(string refreshToken, string? ipAddress, string? deviceInfo)
    {
        var tokenHash = _tokenService.HashRefreshToken(refreshToken);

        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

        if (storedToken is null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        if (storedToken.IsUsed)
        {
            await _tokenService.RevokeTokenFamilyAsync(storedToken.Id);
            await _context.SaveChangesAsync();

            throw new UnauthorizedAccessException("Refresh token reuse detected. All tokens revoked. Please log in again.");
        }

        if (storedToken.RevokedAtUtc is not null || storedToken.IsExpired)
        {
            throw new UnauthorizedAccessException("Refresh token is expired or revoked.");
        }

        var user = await _userManager.FindByIdAsync(storedToken.UserId.ToString());
        if (user is null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var permissions = await _permissionService.GetUserPermissionsAsync(user.Id);

        var newAccessToken = _tokenService.GenerateAccessToken(
            user.Id, user.Email!, roles, permissions);

        var newRawRefreshToken = _tokenService.GenerateRefreshToken();
        var newTokenHash = _tokenService.HashRefreshToken(newRawRefreshToken);
        var newTokenId = Guid.NewGuid();

        await _tokenService.RotateRefreshTokenAsync(storedToken, newTokenHash, newTokenId);
        await _context.SaveChangesAsync();

        return new LoginResponse(
            newAccessToken,
            newRawRefreshToken,
            DateTime.UtcNow.AddMinutes(15));
    }

    public async Task LogoutAsync(Guid userId, string refreshToken)
    {
        var tokenHash = _tokenService.HashRefreshToken(refreshToken);

        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && rt.UserId == userId);

        if (storedToken is not null)
        {
            storedToken.Revoke();
            await _context.SaveChangesAsync();
        }
    }

    public async Task LogoutAllAsync(Guid userId)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAtUtc == null)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.Revoke(reason: "User initiated logout-all");
        }

        await _context.SaveChangesAsync();
    }
}
