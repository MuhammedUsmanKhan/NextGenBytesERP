using System.ComponentModel.DataAnnotations;

namespace NextGenBytes.ERP.Application.Common;

public sealed record UpdateStatusRequest([Required][MaxLength(20)] string Status);
