namespace NextGenBytes.ERP.Domain.Definitions;

public sealed class Customer
{
    public Guid Id { get; set; }
    public string CustomerCode { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? CountryId { get; set; }
    public string? CityId { get; set; }
    public string? PostalCode { get; set; }
    public string? Address { get; set; }
    public string? Area { get; set; }
    public string? CNIC { get; set; }
    public string? NTN { get; set; }
    public string? STRN { get; set; }
    public string Status { get; set; } = "Active";

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}