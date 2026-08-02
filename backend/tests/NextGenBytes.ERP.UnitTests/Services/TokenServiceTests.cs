using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;
using NextGenBytes.ERP.Application.Authentication.Interfaces;
using NextGenBytes.ERP.Domain.Authentication;
using NextGenBytes.ERP.Infrastructure.Authentication.Services;
using NextGenBytes.ERP.Infrastructure.Common;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.UnitTests.Services;

public sealed class TokenServiceTests
{
    private readonly JwtSettings _jwtSettings;
    private readonly AppDbContext _context;
    private readonly ITokenService _sut;

    public TokenServiceTests()
    {
        _jwtSettings = new JwtSettings
        {
            Secret = "ThisIsATestSecretKeyThatIsAtLeast32BytesLong!",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            AccessTokenExpirationMinutes = 15,
            RefreshTokenExpirationDays = 7
        };

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        var jwtOptionsMock = new Mock<IOptions<JwtSettings>>();
        jwtOptionsMock.Setup(x => x.Value).Returns(_jwtSettings);

        _sut = new TokenService(_context, jwtOptionsMock.Object);
    }

    [Fact]
    public void GenerateAccessToken_ReturnsValidJWT_WithCorrectClaims()
    {
        var userId = Guid.NewGuid();
        var email = "test@example.com";
        var roles = new List<string> { "Admin", "Editor" };
        var permissions = new List<string> { "Orders.View", "Orders.Edit", "Users.View" };

        var token = _sut.GenerateAccessToken(userId, email, roles, permissions);

        token.Should().NotBeNullOrEmpty();

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        jwtToken.Subject.Should().Be(userId.ToString());
        jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value.Should().Be(email);
        jwtToken.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value)
            .Should().BeEquivalentTo(roles);
        jwtToken.Claims.Where(c => c.Type == "permission").Select(c => c.Value)
            .Should().BeEquivalentTo(permissions);
    }

    [Fact]
    public void GenerateRefreshToken_ReturnsUniqueToken()
    {
        var token1 = _sut.GenerateRefreshToken();
        var token2 = _sut.GenerateRefreshToken();

        token1.Should().NotBeNullOrEmpty();
        token2.Should().NotBeNullOrEmpty();
        token1.Should().NotBe(token2);
    }

    [Fact]
    public void HashRefreshToken_ReturnsConsistentHash()
    {
        var token = "test-refresh-token-value";

        var hash1 = _sut.HashRefreshToken(token);
        var hash2 = _sut.HashRefreshToken(token);

        hash1.Should().Be(hash2);
    }

    [Fact]
    public void HashRefreshToken_DifferentTokens_DifferentHashes()
    {
        var hash1 = _sut.HashRefreshToken("token-a");
        var hash2 = _sut.HashRefreshToken("token-b");

        hash1.Should().NotBe(hash2);
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_ReturnsToken_WhenExists()
    {
        var userId = Guid.NewGuid();
        var tokenHash = _sut.HashRefreshToken("valid-refresh-token");

        var refreshToken = new RefreshToken(
            Guid.NewGuid(),
            userId,
            tokenHash,
            null,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(7));

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        var result = await _sut.ValidateRefreshTokenAsync(tokenHash, userId);

        result.Should().NotBeNull();
        result!.Id.Should().Be(refreshToken.Id);
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_ReturnsNull_WhenNotExists()
    {
        var result = await _sut.ValidateRefreshTokenAsync("nonexistent-hash", Guid.NewGuid());

        result.Should().BeNull();
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_ReturnsNull_WhenUserIdMismatch()
    {
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var tokenHash = _sut.HashRefreshToken("test-token");

        var refreshToken = new RefreshToken(
            Guid.NewGuid(),
            userId,
            tokenHash,
            null,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(7));

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        var result = await _sut.ValidateRefreshTokenAsync(tokenHash, otherUserId);

        result.Should().BeNull();
    }

    [Fact]
    public async Task RotateRefreshTokenAsync_MarksOldTokenUsed()
    {
        var userId = Guid.NewGuid();
        var oldTokenHash = _sut.HashRefreshToken("old-token");

        var oldToken = new RefreshToken(
            Guid.NewGuid(),
            userId,
            oldTokenHash,
            null,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(7));

        _context.RefreshTokens.Add(oldToken);
        await _context.SaveChangesAsync();

        var newTokenHash = _sut.HashRefreshToken("new-token");
        var newTokenId = Guid.NewGuid();

        await _sut.RotateRefreshTokenAsync(oldToken, newTokenHash, newTokenId);
        await _context.SaveChangesAsync();

        var storedOld = await _context.RefreshTokens.FindAsync(oldToken.Id);
        storedOld!.IsUsed.Should().BeTrue();
        storedOld.ReplacedByTokenId.Should().Be(newTokenId);

        var storedNew = await _context.RefreshTokens.FindAsync(newTokenId);
        storedNew.Should().NotBeNull();
        storedNew!.UserId.Should().Be(userId);
        storedNew.TokenHash.Should().Be(newTokenHash);
    }

    [Fact]
    public async Task RotateRefreshTokenAsync_NewTokenHasCorrectExpiry()
    {
        var userId = Guid.NewGuid();
        var oldToken = new RefreshToken(
            Guid.NewGuid(),
            userId,
            _sut.HashRefreshToken("old"),
            null,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(7));

        _context.RefreshTokens.Add(oldToken);
        await _context.SaveChangesAsync();

        var newTokenHash = _sut.HashRefreshToken("new");
        var newTokenId = Guid.NewGuid();

        await _sut.RotateRefreshTokenAsync(oldToken, newTokenHash, newTokenId);
        await _context.SaveChangesAsync();

        var storedNew = await _context.RefreshTokens.FindAsync(newTokenId);
        storedNew!.ExpiresAtUtc.Should().BeCloseTo(
            DateTime.UtcNow.AddDays(7), TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task RevokeTokenFamilyAsync_RevokesToken()
    {
        var userId = Guid.NewGuid();
        var token = new RefreshToken(
            Guid.NewGuid(),
            userId,
            _sut.HashRefreshToken("chain-token"),
            null,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(7));

        _context.RefreshTokens.Add(token);
        await _context.SaveChangesAsync();

        await _sut.RevokeTokenFamilyAsync(token.Id);
        await _context.SaveChangesAsync();

        var stored = await _context.RefreshTokens.FindAsync(token.Id);
        stored!.RevokedAtUtc.Should().NotBeNull();
        stored.ReasonRevoked.Should().Contain("Theft detected");
    }

    [Fact]
    public async Task RevokeTokenFamilyAsync_RevokesEntireChain()
    {
        var userId = Guid.NewGuid();
        var token1 = new RefreshToken(
            Guid.NewGuid(),
            userId,
            _sut.HashRefreshToken("chain-1"),
            null,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(7));

        var token2 = new RefreshToken(
            Guid.NewGuid(),
            userId,
            _sut.HashRefreshToken("chain-2"),
            null,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(7));

        var token3 = new RefreshToken(
            Guid.NewGuid(),
            userId,
            _sut.HashRefreshToken("chain-3"),
            null,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(7));

        // Chain: token1 -> token2 -> token3
        token1.MarkAsUsed(token2.Id);
        token2.MarkAsUsed(token3.Id);

        _context.RefreshTokens.AddRange(token1, token2, token3);
        await _context.SaveChangesAsync();

        // Trigger revocation from token1 (reuse detection)
        await _sut.RevokeTokenFamilyAsync(token1.Id);
        await _context.SaveChangesAsync();

        var stored1 = await _context.RefreshTokens.FindAsync(token1.Id);
        var stored2 = await _context.RefreshTokens.FindAsync(token2.Id);
        var stored3 = await _context.RefreshTokens.FindAsync(token3.Id);

        stored1!.RevokedAtUtc.Should().NotBeNull();
        stored2!.RevokedAtUtc.Should().NotBeNull();
        stored3!.RevokedAtUtc.Should().NotBeNull();
    }
}
