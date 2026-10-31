using NextGenBytes.ERP.Application.Payroll.DTOs;

namespace NextGenBytes.ERP.Application.Payroll.Interfaces;

public interface IDatFileParser
{
    Task<List<ParsedPunchDto>> ParseDatFileAsync(Stream fileStream, CancellationToken ct = default);
}

