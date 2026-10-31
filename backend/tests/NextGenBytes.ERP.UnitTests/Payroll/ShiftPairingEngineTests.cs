using FluentAssertions;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Domain.Payroll.Enums;
using NextGenBytes.ERP.Infrastructure.Payroll.Services;
using Xunit;

namespace NextGenBytes.ERP.UnitTests.Payroll;

public sealed class ShiftPairingEngineTests
{
    private readonly ShiftPairingEngine _sut = new();

    private readonly Employee _employee = new()
    {
        Id = Guid.NewGuid(),
        Code = "EMP-001",
        FullName = "Arsalan Ahmed",
        BiometricDeviceId = "75",
        Status = "Active"
    };

    private readonly ShiftDefinition _dayShift = new()
    {
        Id = Guid.NewGuid(),
        Name = "Day Shift (9h)",
        ShiftStart = new TimeOnly(8, 0),
        ShiftEnd = new TimeOnly(17, 0),
        ShiftDurationMinutes = 540,
        GraceLateMinutes = 10,
        GraceMode = GraceDeductionMode.DeductAllFromStart,
        IsOvernightShift = false,
        NightShiftStart = new TimeOnly(18, 0),
        NightShiftEnd = new TimeOnly(6, 0),
        IsActive = true
    };

    [Fact]
    public void PairAndCompute_CollapsesRapidDuplicatesWithin60Seconds()
    {
        // 3 punches within 16 seconds (like row 25-27 in client's file)
        var punches = new List<RawPunchLog>
        {
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 3, 8, 0, 0) },
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 3, 8, 0, 15) },
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 3, 8, 0, 30) },
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 3, 17, 0, 0) }
        };

        var daily = _sut.PairAndComputeDailyAttendance(
            punches,
            [_employee],
            [_dayShift],
            [],
            "BATCH-01",
            "tester");

        daily.Should().HaveCount(1);
        daily[0].FirstPunchIn.Should().Be(new TimeOnly(8, 0));
        daily[0].LastPunchOut.Should().Be(new TimeOnly(17, 0));
        daily[0].WorkedMinutes.Should().Be(540);
        daily[0].LateMinutes.Should().Be(0);
        daily[0].HasException.Should().BeFalse();
    }

    [Fact]
    public void PairAndCompute_CalculatesGraceWindowAccurately()
    {
        // Arrival at 08:08 (within 10 min grace) -> Late = 0
        var punchesOnTime = new List<RawPunchLog>
        {
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 4, 8, 8, 0) },
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 4, 17, 0, 0) }
        };

        var daily1 = _sut.PairAndComputeDailyAttendance(punchesOnTime, [_employee], [_dayShift], [], "BATCH-01", "tester");
        daily1[0].LateMinutes.Should().Be(0);

        // Arrival at 08:15 (breaches 10 min grace, DeductAllFromStart) -> Late = 15
        var punchesLate = new List<RawPunchLog>
        {
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 5, 8, 15, 0) },
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 5, 17, 0, 0) }
        };

        var daily2 = _sut.PairAndComputeDailyAttendance(punchesLate, [_employee], [_dayShift], [], "BATCH-01", "tester");
        daily2[0].LateMinutes.Should().Be(15);
    }

    [Fact]
    public void PairAndCompute_FlagsSinglePunchAsMissingCheckoutException()
    {
        // Employee punched in at 08:00 but forgot to punch out
        var punches = new List<RawPunchLog>
        {
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 6, 8, 0, 0) }
        };

        var daily = _sut.PairAndComputeDailyAttendance(punches, [_employee], [_dayShift], [], "BATCH-01", "tester");

        daily.Should().HaveCount(1);
        daily[0].HasException.Should().BeTrue();
        daily[0].IsSinglePunchMissing.Should().BeTrue();
        daily[0].ExceptionType.Should().Be("SINGLE_PUNCH_MISSING");
    }

    [Fact]
    public void PairAndCompute_HandlesOvernightShiftAcrossMidnightAccurately()
    {
        var nightShift = new ShiftDefinition
        {
            Id = Guid.NewGuid(),
            Name = "Furnace Night Shift",
            ShiftStart = new TimeOnly(20, 0),
            ShiftEnd = new TimeOnly(6, 0),
            ShiftDurationMinutes = 600, // 10h
            IsOvernightShift = true,
            NightShiftStart = new TimeOnly(18, 0),
            NightShiftEnd = new TimeOnly(6, 0),
            IsActive = true
        };

        _employee.ShiftDefinition = nightShift;

        // Punched IN at 20:00 on Aug 10, punched OUT at 06:00 on Aug 11
        var punches = new List<RawPunchLog>
        {
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 10, 20, 0, 0) },
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 11, 6, 0, 0) }
        };

        var daily = _sut.PairAndComputeDailyAttendance(punches, [_employee], [nightShift], [], "BATCH-01", "tester");

        var nightRecord = daily.First(d => d.Date == new DateOnly(2026, 8, 10));
        nightRecord.WorkedMinutes.Should().Be(600);
        nightRecord.IsNightShift.Should().BeTrue();

        // Excuses next day's daytime shift (Aug 11) as post-night rest
        var restRecord = daily.First(d => d.Date == new DateOnly(2026, 8, 11));
        restRecord.IsExcusedPostNightRest.Should().BeTrue();
        restRecord.IsAbsent.Should().BeFalse();
    }

    [Fact]
    public void PairAndCompute_Scheduled14hNightShift_Credits840MinutesAndMultiplier()
    {
        // Abdul Rasheed scheduled for 14h night shift (18:00 to 08:00) with 1.5x multiplier
        var rosterAssignment = new ShiftRosterAssignment
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employee.Id,
            Date = new DateOnly(2026, 7, 29),
            ShiftName = "Factory Night Shift (14.0h)",
            ShiftStart = new TimeOnly(18, 0),
            ShiftEnd = new TimeOnly(8, 0),
            ShiftDurationMinutes = 840,
            IsOvernightShift = true,
            PayMultiplier = 1.5m,
            ExcuseOverlappingDayShift = true,
            CreatedBy = "supervisor"
        };

        var punches = new List<RawPunchLog>
        {
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 7, 29, 18, 11, 43) },
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 7, 30, 8, 15, 20) }
        };

        var daily = _sut.PairAndComputeDailyAttendance(
            punches,
            [_employee],
            [_dayShift],
            [],
            "BATCH-ROSTER-01",
            "tester",
            [rosterAssignment]);

        // Shift Date July 29
        var nightRecord = daily.First(d => d.Date == new DateOnly(2026, 7, 29));
        nightRecord.IsNightShift.Should().BeTrue();
        nightRecord.ShiftPayMultiplier.Should().Be(1.5m);
        nightRecord.HasException.Should().BeFalse();

        // July 30 Post-Night Rest Protection
        var restRecord = daily.FirstOrDefault(d => d.Date == new DateOnly(2026, 7, 30));
        restRecord.Should().NotBeNull();
        restRecord!.IsExcusedPostNightRest.Should().BeTrue();
        restRecord.IsAbsent.Should().BeFalse();
    }

    [Fact]
    public void PairAndCompute_UnscheduledNightPunch_FlagsUnscheduledException()
    {
        // Worker punches overnight without prior roster assignment
        var punches = new List<RawPunchLog>
        {
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 7, 30, 18, 5, 0) },
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 7, 31, 8, 5, 0) }
        };

        var daily = _sut.PairAndComputeDailyAttendance(
            punches,
            [_employee],
            [_dayShift],
            [],
            "BATCH-UNSCHEDULED",
            "tester",
            []); // Empty roster

        var nightRecord = daily.First(d => d.Date == new DateOnly(2026, 7, 30));
        nightRecord.IsNightShift.Should().BeTrue();
        nightRecord.HasException.Should().BeTrue();
        nightRecord.ExceptionType.Should().Be("UNSCHEDULED_NIGHT_SHIFT");
        nightRecord.ShiftPayMultiplier.Should().BeNull(); // Held for supervisor review
    }

    [Fact]
    public void PairAndCompute_ExtraHoursPunched_FlagsExtraHoursOvertimeException()
    {
        // Worker scheduled for 18:00 to 06:00 (12h / 720m), punches out at 08:00 (14h / 840m)
        var rosterAssignment = new ShiftRosterAssignment
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employee.Id,
            Date = new DateOnly(2026, 8, 1),
            ShiftName = "Special Night Shift (12.0h)",
            ShiftStart = new TimeOnly(18, 0),
            ShiftEnd = new TimeOnly(6, 0),
            ShiftDurationMinutes = 720,
            IsOvernightShift = true,
            PayMultiplier = 1.5m,
            CreatedBy = "supervisor"
        };

        var punches = new List<RawPunchLog>
        {
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 1, 18, 0, 0) },
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 2, 8, 0, 0) } // 14 hours total
        };

        var daily = _sut.PairAndComputeDailyAttendance(
            punches,
            [_employee],
            [_dayShift],
            [],
            "BATCH-OT-01",
            "tester",
            [rosterAssignment]);

        var nightRecord = daily.First(d => d.Date == new DateOnly(2026, 8, 1));
        nightRecord.IsNightShift.Should().BeTrue();
        nightRecord.HasException.Should().BeTrue();
        nightRecord.ExceptionType.Should().Be("EXTRA_HOURS_OVERTIME");
        nightRecord.OvertimeMinutes.Should().Be(120); // 120 mins excess past scheduled 12h
    }

    [Fact]
    public void PairAndCompute_SinglePunchWithRoster_UsesRosterStartForLateCalculation()
    {
        // Worker scheduled for 18:00 to 08:00 Night Shift
        var rosterAssignment = new ShiftRosterAssignment
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employee.Id,
            Date = new DateOnly(2026, 8, 11),
            ShiftName = "Night Shift (14.0h)",
            ShiftStart = new TimeOnly(18, 0),
            ShiftEnd = new TimeOnly(8, 0),
            ShiftDurationMinutes = 840,
            IsOvernightShift = true,
            PayMultiplier = 1.5m,
            ExcuseOverlappingDayShift = true,
            CreatedBy = "supervisor"
        };

        // Only 1 punch at 18:10 (missing checkout)
        var punches = new List<RawPunchLog>
        {
            new() { Id = Guid.NewGuid(), EmployeeId = _employee.Id, PunchTimestamp = new DateTime(2026, 8, 11, 18, 10, 0) }
        };

        var daily = _sut.PairAndComputeDailyAttendance(
            punches,
            [_employee],
            [_dayShift], // Baseline day shift starts at 08:00
            [],
            "BATCH-SINGLE-ROSTER",
            "tester",
            [rosterAssignment]);

        daily.Should().HaveCount(2);
        var record = daily.First(d => d.Date == new DateOnly(2026, 8, 11));
        record.HasException.Should().BeTrue();
        record.IsSinglePunchMissing.Should().BeTrue();
        record.IsNightShift.Should().BeTrue();
        record.ShiftPayMultiplier.Should().Be(1.5m);
        // Crucial test: LateMinutes must be 0 (18:10 is within 15m grace of 18:00), NOT 610 minutes!
        record.LateMinutes.Should().Be(0);

        // Crucial test 2: Next day is protected as excused post-night rest day
        var restDay = daily.First(d => d.Date == new DateOnly(2026, 8, 12));
        restDay.IsExcusedPostNightRest.Should().BeTrue();
    }
}

