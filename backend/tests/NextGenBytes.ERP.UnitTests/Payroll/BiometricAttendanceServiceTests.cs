using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Domain.Payroll.Enums;
using NextGenBytes.ERP.Infrastructure.Payroll.Services;
using NextGenBytes.ERP.Infrastructure.Persistence;
using Xunit;

namespace NextGenBytes.ERP.UnitTests.Payroll;

public sealed class BiometricAttendanceServiceTests
{
    private readonly AppDbContext _context;
    private readonly ShiftPairingEngine _pairingEngine;
    private readonly BiometricAttendanceService _sut;

    public BiometricAttendanceServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _pairingEngine = new ShiftPairingEngine();
        var parser = new DatFileParser();
        _sut = new BiometricAttendanceService(_context, parser, _pairingEngine);
    }

    [Fact]
    public async Task SyncToMonthlySummary_IndependentEvaluation_CalculatesTriStateAccurately()
    {
        // Setup employee in August 2026 (31 days, 5 Sundays, 26 working days)
        var emp = new Employee
        {
            Id = Guid.NewGuid(),
            Code = "EMP-LAB-001",
            FullName = "Abdul Rasheed",
            Category = "Salaries Labor",
            Status = "Active"
        };
        _context.Employees.Add(emp);

        // 14 verified present days (11 worked + 3 weekday rest)
        // Aug 1 (Sat): worked
        _context.DailyAttendances.Add(new DailyAttendance
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            Date = new DateOnly(2026, 8, 1),
            WorkedMinutes = 600,
            IsAbsent = false,
            CreatedBy = "test"
        });

        // 10 single punch exceptions
        for (int day = 3; day <= 12; day++)
        {
            _context.DailyAttendances.Add(new DailyAttendance
            {
                Id = Guid.NewGuid(),
                EmployeeId = emp.Id,
                Date = new DateOnly(2026, 8, day),
                WorkedMinutes = 0,
                IsSinglePunchMissing = true,
                HasException = true,
                IsResolved = false,
                CreatedBy = "test"
            });
        }

        // Sunday Aug 9: Post night rest falling on a Sunday (must NOT be double counted!)
        _context.DailyAttendances.Add(new DailyAttendance
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            Date = new DateOnly(2026, 8, 9),
            WorkedMinutes = 0,
            IsExcusedPostNightRest = true,
            IsWeekend = true,
            CreatedBy = "test"
        });

        // Other working days with zero records will be evaluated as absent
        await _context.SaveChangesAsync();

        var result = await _sut.SyncToMonthlySummaryAsync("2026-08", "tester");
        result.Success.Should().BeTrue();

        var summary = await _context.AttendanceSummaries.FirstOrDefaultAsync(s => s.EmployeeId == emp.Id && s.MonthYear == "2026-08");
        summary.Should().NotBeNull();
        summary!.DaysPresent.Should().Be(1); // 1 worked
        summary.PendingExceptionsCount.Should().Be(9); // 9 single punches (Aug 3-12 excluding Sunday Aug 9)
        // Aug 9 is Sunday, so only 9 single punches fell on working days
    }

    [Fact]
    public async Task BulkResolveExceptions_ResolvesAllRecordsAndClearsPending()
    {
        var emp = new Employee
        {
            Id = Guid.NewGuid(),
            Code = "EMP-LAB-001",
            FullName = "Abdul Rasheed",
            Category = "Salaries Labor",
            Status = "Active"
        };
        _context.Employees.Add(emp);

        var d1 = new DailyAttendance
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            Date = new DateOnly(2026, 8, 3),
            FirstPunchIn = new TimeOnly(18, 16),
            WorkedMinutes = 0,
            IsSinglePunchMissing = true,
            HasException = true,
            IsResolved = false,
            CreatedBy = "test"
        };
        var d2 = new DailyAttendance
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            Date = new DateOnly(2026, 8, 4),
            FirstPunchIn = new TimeOnly(18, 10),
            WorkedMinutes = 0,
            IsSinglePunchMissing = true,
            HasException = true,
            IsResolved = false,
            CreatedBy = "test"
        };
        _context.DailyAttendances.AddRange(d1, d2);
        await _context.SaveChangesAsync();

        // 1. Get Preview
        var previewRes = await _sut.GetBulkResolvePreviewAsync("2026-08", null, emp.Id);
        previewRes.Success.Should().BeTrue();
        previewRes.Data.Should().HaveCount(2);
        previewRes.Data![0].SuggestedPunchOut.Should().Be(new TimeOnly(8, 0)); // Evening punch defaults to 08:00 AM

        // 2. Execute Bulk Resolve
        var request = new BulkResolveExceptionsRequest
        {
            DailyAttendanceIds = [d1.Id, d2.Id],
            DefaultSuggestedPunchOut = new TimeOnly(8, 0),
            ApproveBaseWage = true,
            ApproveOvertimePremium = true,
            ApprovedMultiplier = 1.5m,
            SupervisorNotes = "Supervisor confirmed attendance."
        };

        var resolveRes = await _sut.BulkResolveExceptionsAsync(request, "supervisor");
        resolveRes.Success.Should().BeTrue();
        resolveRes.Data.Should().Be(2);

        var updated1 = await _context.DailyAttendances.FindAsync(d1.Id);
        updated1!.IsResolved.Should().BeTrue();
        updated1.IsSinglePunchMissing.Should().BeFalse();
        updated1.HasException.Should().BeFalse();
        updated1.LastPunchOut.Should().Be(new TimeOnly(8, 0));
        updated1.WorkedMinutes.Should().Be(824); // 18:16 to 08:00 next day = 13h 44m = 824 mins
    }

    [Fact]
    public async Task SyncToMonthlySummary_FullAugust2026Dataset_Produces14Present10Pending2Absent()
    {
        var emp = new Employee
        {
            Id = Guid.NewGuid(),
            Code = "EMP-LAB-001",
            FullName = "Abdul Rasheed",
            Category = "Salaries Labor",
            Status = "Active"
        };
        _context.Employees.Add(emp);

        // 3 Clean Day Shifts
        foreach (var day in new[] { 1, 15, 25 })
        {
            _context.DailyAttendances.Add(new DailyAttendance
            {
                Id = Guid.NewGuid(),
                EmployeeId = emp.Id,
                Date = new DateOnly(2026, 8, day),
                WorkedMinutes = 600,
                IsAbsent = false,
                CreatedBy = "test"
            });
        }

        // 8 Paired Night Shifts
        foreach (var day in new[] { 7, 10, 11, 12, 17, 18, 21, 28 })
        {
            _context.DailyAttendances.Add(new DailyAttendance
            {
                Id = Guid.NewGuid(),
                EmployeeId = emp.Id,
                Date = new DateOnly(2026, 8, day),
                WorkedMinutes = 840,
                IsNightShift = true,
                ShiftPayMultiplier = 1.5m,
                IsAbsent = false,
                CreatedBy = "test"
            });
        }

        // 3 Weekday Post-Night Rest Days (Aug 6 Thu, Aug 14 Fri, Aug 20 Thu)
        foreach (var day in new[] { 6, 14, 20 })
        {
            _context.DailyAttendances.Add(new DailyAttendance
            {
                Id = Guid.NewGuid(),
                EmployeeId = emp.Id,
                Date = new DateOnly(2026, 8, day),
                WorkedMinutes = 0,
                IsExcusedPostNightRest = true,
                IsWeekend = false,
                CreatedBy = "test"
            });
        }

        // 3 Sunday Post-Night Rest Days (Aug 9, Aug 23, Aug 30) - protected weekend rest
        foreach (var day in new[] { 9, 23, 30 })
        {
            _context.DailyAttendances.Add(new DailyAttendance
            {
                Id = Guid.NewGuid(),
                EmployeeId = emp.Id,
                Date = new DateOnly(2026, 8, day),
                WorkedMinutes = 0,
                IsExcusedPostNightRest = true,
                IsWeekend = true,
                CreatedBy = "test"
            });
        }

        // 10 Single Punch Incomplete Shifts (Aug 3, 4, 5, 8, 13, 19, 22, 27, 29, 31)
        foreach (var day in new[] { 3, 4, 5, 8, 13, 19, 22, 27, 29, 31 })
        {
            _context.DailyAttendances.Add(new DailyAttendance
            {
                Id = Guid.NewGuid(),
                EmployeeId = emp.Id,
                Date = new DateOnly(2026, 8, day),
                WorkedMinutes = 0,
                IsSinglePunchMissing = true,
                HasException = true,
                IsResolved = false,
                CreatedBy = "test"
            });
        }

        // Aug 24 (Mon) & Aug 26 (Wed) have zero punches and no record (True Absences)

        await _context.SaveChangesAsync();

        var result = await _sut.SyncToMonthlySummaryAsync("2026-08", "tester");
        result.Success.Should().BeTrue();

        var summary = await _context.AttendanceSummaries.FirstAsync(s => s.EmployeeId == emp.Id && s.MonthYear == "2026-08");
        summary.DaysPresent.Should().Be(14m); // 3 day + 8 night + 3 weekday rest
        summary.PendingExceptionsCount.Should().Be(10); // 10 single punches on working days
        summary.AbsentDays.Should().Be(2m); // Aug 24 and Aug 26
    }
}
