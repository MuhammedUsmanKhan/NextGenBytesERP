using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Domain.Payroll.Enums;
using NextGenBytes.ERP.Infrastructure.Payroll.Services;
using NextGenBytes.ERP.Infrastructure.Persistence;
using Xunit;

namespace NextGenBytes.ERP.UnitTests.Payroll;

public sealed class AttendanceServiceTests
{
    private readonly AppDbContext _context;
    private readonly AttendanceService _sut;

    public AttendanceServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _sut = new AttendanceService(_context);
    }

    [Fact]
    public async Task GetMonthAttendanceAsync_ReturnsAllActiveEmployees_WithDefaultOrExistingSummaries()
    {
        var emp1 = new Employee { Id = Guid.NewGuid(), Code = "EMP-01", FullName = "Emp 1", Category = "Salaries Labor", Status = "Active" };
        var emp2 = new Employee { Id = Guid.NewGuid(), Code = "EMP-02", FullName = "Emp 2", Category = "Salaries Labor", Status = "Active" };
        _context.Employees.AddRange(emp1, emp2);

        // emp1 has an existing attendance record for 2026-01
        _context.AttendanceSummaries.Add(new AttendanceSummary
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp1.Id,
            MonthYear = "2026-01",
            AbsentDays = 2,
            LateMinutes = 60,
            NightShiftsCount = 3,
            NightShiftMinutes = 2520,
            OvertimeMinutes = 180,
            OvertimeHours = 3m
        });
        await _context.SaveChangesAsync();

        var result = await _sut.GetMonthAttendanceAsync("2026-01");

        result.Success.Should().BeTrue();
        result.Data.Should().HaveCount(2);

        var item1 = result.Data!.First(x => x.EmployeeId == emp1.Id);
        item1.AbsentDays.Should().Be(2);
        item1.LateMinutes.Should().Be(60);
        item1.NightShiftsCount.Should().Be(3);

        var item2 = result.Data!.First(x => x.EmployeeId == emp2.Id);
        item2.AbsentDays.Should().Be(0);
        item2.LateMinutes.Should().Be(0);
    }

    [Fact]
    public async Task UpsertAsync_CreatesNewAttendanceSummary_WithCalculatedNightMinutes()
    {
        var emp = new Employee { Id = Guid.NewGuid(), Code = "EMP-LAB", FullName = "Abdul Rasheed", Category = "Salaries Labor", Status = "Active" };
        emp.Contracts.Add(new EmployeeContract
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            NightShiftMinutes = 840,
            IsActive = true
        });
        _context.Employees.Add(emp);
        await _context.SaveChangesAsync();

        var req = new UpsertAttendanceRequest
        {
            MonthYear = "2026-01",
            Item = new UpsertAttendanceItem
            {
                EmployeeId = emp.Id,
                AbsentDays = 2,
                LateMinutes = 0,
                NightShiftsCount = 7, // 7 nights * 840 = 5880 mins
                OvertimeHours = 24m   // 24 hours = 1440 mins
            }
        };

        var result = await _sut.UpsertAsync(req, "tester");

        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.NightShiftMinutes.Should().Be(5880);
        result.Data.OvertimeMinutes.Should().Be(1440);
        result.Data.AbsentDays.Should().Be(2);

        var inDb = await _context.AttendanceSummaries.FirstOrDefaultAsync(x => x.EmployeeId == emp.Id && x.MonthYear == "2026-01");
        inDb.Should().NotBeNull();
        inDb!.NightShiftMinutes.Should().Be(5880);
        inDb.OvertimeMinutes.Should().Be(1440);
    }

    [Fact]
    public async Task BulkUpsertAsync_SavesMultipleEmployeeRecords()
    {
        var emp1 = new Employee { Id = Guid.NewGuid(), Code = "EMP-01", FullName = "Worker 1", Status = "Active" };
        var emp2 = new Employee { Id = Guid.NewGuid(), Code = "EMP-02", FullName = "Worker 2", Status = "Active" };
        _context.Employees.AddRange(emp1, emp2);
        await _context.SaveChangesAsync();

        var req = new BulkUpsertAttendanceRequest
        {
            MonthYear = "2026-01",
            Items =
            [
                new UpsertAttendanceItem { EmployeeId = emp1.Id, DaysPresent = 25, LateMinutes = 45 },
                new UpsertAttendanceItem { EmployeeId = emp2.Id, DaysPresent = 27, LateMinutes = 0 }
            ]
        };

        var result = await _sut.BulkUpsertAsync(req, "admin");

        result.Success.Should().BeTrue();
        result.Data.Should().Be(2);

        var records = await _context.AttendanceSummaries.Where(x => x.MonthYear == "2026-01").ToListAsync();
        records.Should().HaveCount(2);
    }
}

