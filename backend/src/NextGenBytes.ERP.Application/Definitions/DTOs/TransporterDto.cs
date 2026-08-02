using System.ComponentModel.DataAnnotations;
using NextGenBytes.ERP.Domain.Definitions;

namespace NextGenBytes.ERP.Application.Definitions.DTOs;

public sealed record TransporterResponse(
    Guid Id,
    string Code,
    string Name,
    string? ContactPerson,
    string? Phone,
    string? Email,
    string? Address,
    string Status,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public sealed record CreateTransporterRequest(
    [Required][MaxLength(256)] string Name,
    [MaxLength(256)] string? ContactPerson,
    [MaxLength(50)] string? Phone,
    [MaxLength(256)] string? Email,
    [MaxLength(512)] string? Address,
    [Required][MaxLength(20)] string Status);

public sealed record UpdateTransporterRequest(
    [Required][MaxLength(256)] string Name,
    [MaxLength(256)] string? ContactPerson,
    [MaxLength(50)] string? Phone,
    [MaxLength(256)] string? Email,
    [MaxLength(512)] string? Address,
    [Required][MaxLength(20)] string Status);

public static class TransporterMappings
{
    public static TransporterResponse ToResponse(this Transporter entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.ContactPerson,
        entity.Phone,
        entity.Email,
        entity.Address,
        entity.Status,
        entity.CreatedAt,
        entity.CreatedBy,
        entity.UpdatedAt,
        entity.UpdatedBy);
}
