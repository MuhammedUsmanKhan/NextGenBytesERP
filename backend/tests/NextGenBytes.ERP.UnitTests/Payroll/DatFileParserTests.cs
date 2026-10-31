using System.Text;
using FluentAssertions;
using NextGenBytes.ERP.Infrastructure.Payroll.Services;
using Xunit;

namespace NextGenBytes.ERP.UnitTests.Payroll;

public sealed class DatFileParserTests
{
    private readonly DatFileParser _parser = new();

    [Fact]
    public async Task ParseDatFileAsync_ParsesTabSeparatedPunches_AndFiltersResetDates()
    {
        var rawData = """
        77	2000-01-01 02:17:39	1	0	0	0
        1	2000-01-01 02:18:21	1	0	0	0
        75	2026-07-29 17:09:28	1	1	0	0
        75	2026-07-29 17:09:35	1	0	0	0
        9	2026-07-29 17:14:46	1	0	0	0
        8	2026-07-29 17:14:53	1	0	0	0
        """;

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(rawData));
        var result = await _parser.ParseDatFileAsync(stream);

        // First 2 records are year 2000 (RTC reset) and must be discarded
        result.Should().HaveCount(4);

        result[0].BiometricDeviceId.Should().Be("75");
        result[0].Timestamp.Should().Be(new DateTime(2026, 7, 29, 17, 9, 28));
        result[0].PunchState.Should().Be(1);

        result[1].BiometricDeviceId.Should().Be("75");
        result[1].Timestamp.Should().Be(new DateTime(2026, 7, 29, 17, 9, 35));
        result[1].PunchState.Should().Be(0);

        result[2].BiometricDeviceId.Should().Be("9");
        result[3].BiometricDeviceId.Should().Be("8");
    }

    [Fact]
    public async Task ParseDatFileAsync_HandlesHeaderLines_Gracefully()
    {
        var rawData = """
        Column 1,Column 2,Column 3,Column 4,Column 5,Column 6
        75,2026-07-29 17:09:28,1,1,0,0
        """;

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(rawData));
        var result = await _parser.ParseDatFileAsync(stream);

        result.Should().HaveCount(1);
        result[0].BiometricDeviceId.Should().Be("75");
    }
}

