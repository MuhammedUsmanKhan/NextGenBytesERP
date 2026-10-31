using System.Globalization;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Interfaces;

namespace NextGenBytes.ERP.Infrastructure.Payroll.Services;

public sealed class DatFileParser : IDatFileParser
{
    private static readonly string[] TimestampFormats =
    [
        "yyyy-MM-dd HH:mm:ss",
        "yyyy/MM/dd HH:mm:ss",
        "yyyy-MM-ddTHH:mm:ss",
        "yyyyMMddHHmmss"
    ];

    public async Task<List<ParsedPunchDto>> ParseDatFileAsync(Stream fileStream, CancellationToken ct = default)
    {
        var results = new List<ParsedPunchDto>();
        using var reader = new StreamReader(fileStream);

        string? line;
        while ((line = await reader.ReadLineAsync(ct)) != null)
        {
            if (string.IsNullOrWhiteSpace(line))
                continue;

            // Support tab, comma, or multi-space separation
            string[] parts;
            if (line.Contains('\t'))
            {
                parts = line.Split('\t', StringSplitOptions.TrimEntries);
            }
            else if (line.Contains(','))
            {
                parts = line.Split(',', StringSplitOptions.TrimEntries);
            }
            else
            {
                parts = line.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            }

            if (parts.Length < 2)
                continue;

            // Skip header lines like "Column 1, Column 2..." or "UserID, Time..."
            if (parts[0].Equals("Column 1", StringComparison.OrdinalIgnoreCase) ||
                parts[0].Equals("UserID", StringComparison.OrdinalIgnoreCase) ||
                parts[0].Equals("AC-No", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var deviceId = parts[0];

            if (!DateTime.TryParseExact(parts[1], TimestampFormats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var timestamp))
            {
                if (!DateTime.TryParse(parts[1], CultureInfo.InvariantCulture, DateTimeStyles.None, out timestamp))
                {
                    continue; // Skip invalid timestamp rows
                }
            }

            // Discard battery-drain reset dates (e.g. 2000-01-01)
            if (timestamp.Year < 2020)
                continue;

            var terminalId = parts.Length > 2 && int.TryParse(parts[2], out var tid) ? tid : 1;
            var punchState = parts.Length > 3 && int.TryParse(parts[3], out var ps) ? ps : 0;
            var workCode = parts.Length > 4 && int.TryParse(parts[4], out var wc) ? wc : 0;

            results.Add(new ParsedPunchDto(deviceId, timestamp, terminalId, punchState, workCode));
        }

        return results;
    }
}

