using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NextGenBytes.ERP.Application.Authentication.DTOs;
using NextGenBytes.ERP.Application.Authentication.Interfaces;

namespace NextGenBytes.ERP.Api.Controllers.V1;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IWebHostEnvironment _env;

    public AuthController(IAuthService authService, IWebHostEnvironment env)
    {
        _authService = authService;
        _env = env;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EndpointSummary("Authenticate user and return JWT access token + refresh token cookie")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        [FromHeader(Name = "X-Forwarded-For")] string? forwardedFor,
        [FromHeader(Name = "User-Agent")] string? userAgent)
    {
        var ipAddress = forwardedFor ?? HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await _authService.LoginAsync(request, ipAddress, userAgent);

        SetRefreshTokenCookie(result.RefreshToken);

        return Ok(new
        {
            success = true,
            data = new
            {
                accessToken = result.AccessToken,
                expiresAt = result.ExpiresAt
            },
            message = (string?)null,
            traceId = HttpContext.TraceIdentifier
        });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EndpointSummary("Refresh JWT access token using httpOnly refresh token cookie")]
    [ProducesResponseType(typeof(RefreshResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(
        [FromHeader(Name = "X-Forwarded-For")] string? forwardedFor,
        [FromHeader(Name = "User-Agent")] string? userAgent)
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new
            {
                success = false,
                errors = new[] { new { field = "refreshToken", message = "Refresh token cookie is missing." } },
                message = "Authentication required.",
                traceId = HttpContext.TraceIdentifier
            });
        }

        var ipAddress = forwardedFor ?? HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await _authService.RefreshAsync(refreshToken, ipAddress, userAgent);

        SetRefreshTokenCookie(result.RefreshToken);

        return Ok(new
        {
            success = true,
            data = new
            {
                accessToken = result.AccessToken,
                expiresAt = result.ExpiresAt
            },
            message = (string?)null,
            traceId = HttpContext.TraceIdentifier
        });
    }

    [HttpPost("logout")]
    [Authorize]
    [EndpointSummary("Revoke current refresh token")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout()
    {
        var userId = GetUserId();
        var refreshToken = Request.Cookies["refreshToken"];

        if (!string.IsNullOrEmpty(refreshToken))
        {
            await _authService.LogoutAsync(userId, refreshToken);
        }

        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/v1/auth"
        });

        return NoContent();
    }

    [HttpPost("logout-all")]
    [Authorize]
    [EndpointSummary("Revoke all refresh tokens for the current user")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LogoutAll()
    {
        var userId = GetUserId();

        await _authService.LogoutAllAsync(userId);

        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/v1/auth"
        });

        return NoContent();
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");
        return Guid.Parse(sub!);
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !_env.IsDevelopment(),
            SameSite = SameSiteMode.Strict,
            Path = "/api/v1/auth",
            Expires = DateTime.UtcNow.AddDays(7)
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}
