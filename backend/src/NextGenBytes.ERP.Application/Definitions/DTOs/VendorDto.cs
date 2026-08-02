using System.ComponentModel.DataAnnotations;
using NextGenBytes.ERP.Domain.Definitions;

namespace NextGenBytes.ERP.Application.Definitions.DTOs;

public sealed record VendorResponse(
    Guid Id,
    string VendorCode,
    string CompanyName,
    string? ContactPerson,
    string? Email,
    string? CountryId,
    string? CityId,
    string? PostalCode,
    string? Address,
    string? Area,
    string? CNIC,
    string? NTN,
    string? STRN,
    string Status,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public sealed record CreateVendorRequest(
    [Required][MaxLength(256)] string CompanyName,
    [MaxLength(256)] string? ContactPerson,
    [MaxLength(256)] string? Email,
    [MaxLength(50)] string? CountryId,
    [MaxLength(50)] string? CityId,
    [MaxLength(20)] string? PostalCode,
    [MaxLength(500)] string? Address,
    [MaxLength(200)] string? Area,
    [MaxLength(50)] string? CNIC,
    [MaxLength(50)] string? NTN,
    [MaxLength(50)] string? STRN,
    [Required][MaxLength(20)] string Status);

public sealed record UpdateVendorRequest(
    [Required][MaxLength(256)] string CompanyName,
    [MaxLength(256)] string? ContactPerson,
    [MaxLength(256)] string? Email,
    [MaxLength(50)] string? CountryId,
    [MaxLength(50)] string? CityId,
    [MaxLength(20)] string? PostalCode,
    [MaxLength(500)] string? Address,
    [MaxLength(200)] string? Area,
    [MaxLength(50)] string? CNIC,
    [MaxLength(50)] string? NTN,
    [MaxLength(50)] string? STRN,
    [Required][MaxLength(20)] string Status);

public sealed record NextVendorCodeResponse(
    string VendorCode);

public static class VendorMappings
{
    public static VendorResponse ToResponse(this Vendor entity) => new(
        entity.Id,
        entity.VendorCode,
        entity.CompanyName,
        entity.ContactPerson,
        entity.Email,
        entity.CountryId,
        entity.CityId,
        entity.PostalCode,
        entity.Address,
        entity.Area,
        entity.CNIC,
        entity.NTN,
        entity.STRN,
        entity.Status,
        entity.CreatedAt,
        entity.CreatedBy,
        entity.UpdatedAt,
        entity.UpdatedBy);
}
