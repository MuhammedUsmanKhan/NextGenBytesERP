using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.IdentityModel.Tokens;
using SupplyChainManagement.Infrastructure.Common;

namespace SupplyChainManagement.IntegrationTests.Controllers;

public sealed class AuthIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AuthIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("environment", "Testing");
            builder.UseSetting("UseInMemoryDatabase", "true");
        });
    }

    [Fact]
    public async Task GetRoles_WithoutAuth_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/v1/roles");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetRoles_WithUserWithoutPermission_Returns403()
    {
        var client = _factory.CreateClient();
        var token = GenerateTestToken(roles: ["Viewer"], permissions: ["Orders.View"]);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/v1/roles");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetRoles_WithUserWithRolesManagePermission_Returns200()
    {
        var client = _factory.CreateClient();
        var token = GenerateTestToken(roles: ["Admin"], permissions: ["Roles.Manage", "Orders.View"]);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/v1/roles");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetPermissions_WithoutPermission_Returns403()
    {
        var client = _factory.CreateClient();
        var token = GenerateTestToken(roles: ["Viewer"], permissions: ["Orders.View"]);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/v1/permissions");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetPermissions_WithRolesManagePermission_Returns200()
    {
        var client = _factory.CreateClient();
        var token = GenerateTestToken(roles: ["Admin"], permissions: ["Roles.Manage"]);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/v1/permissions");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private static string GenerateTestToken(
        IList<string>? roles = null,
        IList<string>? permissions = null,
        Guid? userId = null)
    {
        var jwtSettings = new JwtSettings
        {
            Secret = "THIS_IS_A_DEVELOPMENT_SECRET_REPLACE_IN_PRODUCTION_0123456789ABCDEF",
            Issuer = "SupplyChainManagement",
            Audience = "SupplyChainManagement",
            AccessTokenExpirationMinutes = 15
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, (userId ?? Guid.NewGuid()).ToString()),
            new(JwtRegisteredClaimNames.Email, "test@example.com"),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        if (roles is not null)
        {
            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));
        }

        if (permissions is not null)
        {
            foreach (var perm in permissions)
                claims.Add(new Claim("permission", perm));
        }

        var token = new JwtSecurityToken(
            issuer: jwtSettings.Issuer,
            audience: jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
