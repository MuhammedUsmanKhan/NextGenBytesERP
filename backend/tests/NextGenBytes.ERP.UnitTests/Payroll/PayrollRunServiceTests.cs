using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Services;
using NextGenBytes.ERP.Application.Payroll.Strategies;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Domain.Payroll.Enums;
using NextGenBytes.ERP.Infrastructure.Payroll.Services;
using NextGenBytes.ERP.Infrastructure.Persistence;
using Xunit;

namespace NextGenBytes.ERP.UnitTests.Payroll;

public sealed class PayrollRunServiceTests
{
    private readonly AppDbContext _context;
    private readonly PayrollCalculationEngine _engine;
    private readonly PayrollRunService _sut;

    public PayrollRunServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);

        var strategies = new IAbsenceDeductionStrategy[]
        {
            new FirstDayFreeDeductionStrategy(),
            new ThresholdGraceDeductionStrategy(),
            new StandardFullDeductionStrategy()
        };
        var factory = new AbsenceStrategyFactory(strategies);
        _engine = new PayrollCalculationEngine(factory);

        _sut = new PayrollRunService(_context, _engine);
    }

    [Fact]
    public async Task CreateOrRecalculate_CalculatesDraftRunAccurately()
    {
        // 1. Arrange employee + contract
        var emp = new Employee { Id = Guid.NewGuid(), Code = "EMP-001", FullName = "Arsalan Ahmed", Status = "Active" };
        var contract = new EmployeeContract
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            PayType = PayType.Monthly,
            BasicRate = 10000m,
            AttendanceAllowance = 0m,
            DailyShiftHours = 9.0m,
            MonthlyDivisorDays = 30,
            GraceAbsentDays = 1,
            AbsencePolicy = AbsencePolicy.FirstDayFree_DeductRemaining,
            RoundingMode = RoundingMode.Ceiling10,
            IsActive = true
        };

        // 2. Attendance summary
        var attendance = new AttendanceSummary
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            MonthYear = "2026-01",
            AbsentDays = 2,
            LateMinutes = 2140
        };

        _context.Employees.Add(emp);
        _context.EmployeeContracts.Add(contract);
        _context.AttendanceSummaries.Add(attendance);
        await _context.SaveChangesAsync();

        // 3. Act
        var req = new CreatePayrollRunRequest { MonthYear = "2026-01", Notes = "January 2026 Run" };
        var res = await _sut.CreateOrRecalculateRunAsync(req, "tester");

        // 4. Assert
        res.Success.Should().BeTrue();
        res.Data.Should().NotBeNull();
        res.Data!.Run.Status.Should().Be(PayrollRunStatus.Draft);
        res.Data.Run.EmployeeCount.Should().Be(1);
        res.Data.Run.TotalGrossSalary.Should().Be(10000m);
        res.Data.Run.TotalDueGrossRounded.Should().Be(8350m);
        res.Data.Run.TotalNetSalary.Should().Be(8350m);
        res.Data.Payslips.Should().HaveCount(1);

        var slip = res.Data.Payslips[0];
        slip.DueGrossSalaryRounded.Should().Be(8350m);
        slip.NetSalary.Should().Be(8350m);
        slip.Denomination.Should().NotBeNull();
        slip.Denomination!.Note5000.Should().Be(1);
        slip.Denomination.Note1000.Should().Be(3);
    }

    [Fact]
    public async Task ApproveRun_DeductsLoanBalance_AndLocksRun()
    {
        // 1. Arrange employee, contract, attendance, and active loan
        var emp = new Employee { Id = Guid.NewGuid(), Code = "EMP-002", FullName = "Yasir Khan", Status = "Active" };
        var contract = new EmployeeContract
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            PayType = PayType.Monthly,
            BasicRate = 10000m,
            DailyShiftHours = 9.0m,
            MonthlyDivisorDays = 30,
            GraceAbsentDays = 1,
            AbsencePolicy = AbsencePolicy.FirstDayFree_DeductRemaining,
            RoundingMode = RoundingMode.Ceiling10,
            IsActive = true
        };
        var attendance = new AttendanceSummary
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            MonthYear = "2026-01",
            AbsentDays = 1,
            LateMinutes = 617
        };
        var loan = new LoanAndAdvance
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            Type = LoanType.Loan,
            TotalAmount = 10000m,
            MonthlyDeduction = 2000m,
            RemainingBalance = 10000m,
            Status = LoanStatus.Active,
            DisbursedDate = new DateTime(2026, 1, 1)
        };

        _context.Employees.Add(emp);
        _context.EmployeeContracts.Add(contract);
        _context.AttendanceSummaries.Add(attendance);
        _context.LoansAndAdvances.Add(loan);
        await _context.SaveChangesAsync();

        // 2. Create Run
        var createRes = await _sut.CreateOrRecalculateRunAsync(new CreatePayrollRunRequest { MonthYear = "2026-01" }, "tester");
        createRes.Success.Should().BeTrue();
        var runId = createRes.Data!.Run.Id;

        // 3. Approve Run
        var approveRes = await _sut.ApproveRunAsync(runId, "manager");
        approveRes.Success.Should().BeTrue();
        approveRes.Data!.Status.Should().Be(PayrollRunStatus.Approved);

        // 4. Verify loan balance updated from 10000 -> 8000
        var updatedLoan = await _context.LoansAndAdvances.FindAsync(loan.Id);
        updatedLoan.Should().NotBeNull();
        updatedLoan!.RemainingBalance.Should().Be(8000m);
        updatedLoan.Status.Should().Be(LoanStatus.Active);

        // 5. Verify deleting an approved run is rejected
        var delRes = await _sut.DeleteRunAsync(runId, "tester");
        delRes.Success.Should().BeFalse();
    }

    [Fact]
    public async Task ApproveRun_Fails_WhenUnresolvedAttendanceExceptionsExist()
    {
        // 1. Arrange employee + contract
        var emp = new Employee { Id = Guid.NewGuid(), Code = "EMP-003", FullName = "Bilal Tariq", Status = "Active" };
        var contract = new EmployeeContract
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            PayType = PayType.Monthly,
            BasicRate = 15000m,
            IsActive = true
        };
        var attendanceSummary = new AttendanceSummary
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            MonthYear = "2026-01",
            DaysPresent = 25m
        };

        // Unresolved attendance exception for January 2026
        var exceptionAttendance = new DailyAttendance
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            Date = new DateOnly(2026, 1, 15),
            FirstPunchIn = new TimeOnly(9, 0),
            LastPunchOut = null,
            IsSinglePunchMissing = true,
            HasException = true,
            IsResolved = false,
            ExceptionType = "SINGLE_PUNCH_MISSING"
        };

        _context.Employees.Add(emp);
        _context.EmployeeContracts.Add(contract);
        _context.AttendanceSummaries.Add(attendanceSummary);
        _context.DailyAttendances.Add(exceptionAttendance);
        await _context.SaveChangesAsync();

        // 2. Create Run
        var createRes = await _sut.CreateOrRecalculateRunAsync(new CreatePayrollRunRequest { MonthYear = "2026-01" }, "tester");
        createRes.Success.Should().BeTrue();
        var runId = createRes.Data!.Run.Id;

        // 3. Act: Attempt approval without override
        var approveRes = await _sut.ApproveRunAsync(runId, "manager", allowOverride: false);

        // 4. Assert: Blocked by Safety Gate
        approveRes.Success.Should().BeFalse();
        approveRes.Message.Should().Contain("unresolved attendance exception");

        // 5. Act: Supervisor override
        var overrideRes = await _sut.ApproveRunAsync(runId, "supervisor", allowOverride: true);
        overrideRes.Success.Should().BeTrue();
        overrideRes.Data!.Status.Should().Be(PayrollRunStatus.Approved);

        var approvedRun = await _context.PayrollRuns.FindAsync(runId);
        approvedRun!.Notes.Should().Contain("Supervisor Override");
    }
}
