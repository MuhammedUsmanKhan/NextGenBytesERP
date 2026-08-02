namespace NextGenBytes.ERP.Domain.Authentication;

public sealed class RefreshToken
{
    private RefreshToken() { }

    public RefreshToken(
        Guid id,
        Guid userId,
        string tokenHash,
        string? deviceInfo,
        DateTime createdAtUtc,
        DateTime expiresAtUtc)
    {
        Id = id;
        UserId = userId;
        TokenHash = tokenHash ?? throw new ArgumentNullException(nameof(tokenHash));
        DeviceInfo = deviceInfo;
        CreatedAtUtc = createdAtUtc;
        ExpiresAtUtc = expiresAtUtc;
        IsUsed = false;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = null!;
    public string? DeviceInfo { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime ExpiresAtUtc { get; private set; }
    public DateTime? RevokedAtUtc { get; private set; }
    public Guid? ReplacedByTokenId { get; private set; }
    public bool IsUsed { get; private set; }
    public string? CreatedByIp { get; private set; }
    public string? RevokedByIp { get; private set; }
    public string? ReasonRevoked { get; private set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAtUtc;
    public bool IsActive => !IsUsed && !IsExpired && RevokedAtUtc == null;

    public void MarkAsUsed(Guid replacedByTokenId)
    {
        IsUsed = true;
        ReplacedByTokenId = replacedByTokenId;
    }

    public void Revoke(string? revokedByIp = null, string? reason = null)
    {
        RevokedAtUtc = DateTime.UtcNow;
        RevokedByIp = revokedByIp;
        ReasonRevoked = reason ?? ReasonRevoked;
    }

    public void SetCreatedByIp(string? ip) => CreatedByIp = ip;
}
