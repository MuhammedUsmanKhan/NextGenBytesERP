using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Domain.Payroll.Enums;
using NextGenBytes.ERP.Infrastructure.Payroll.Services;
using NextGenBytes.ERP.Infrastructure.Persistence;
using Xunit;

namespace NextGenBytes.ERP.UnitTests.Payroll;

public sealed class LoanServiceTests
{
    private readonly AppDbContext _context;
    private readonly LoanService _sut;

    public LoanServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _sut = new LoanService(_context);
    }

    [Fact]
    public async Task CreateAsync_DisbursesSalaryAdvance_WithFullDeductionDefault()
    {
        var emp = new Employee { Id = Guid.NewGuid(), Code = "EMP-01", FullName = "Abdul Rasheed", Status = "Active" };
        _context.Employees.Add(emp);
        await _context.SaveChangesAsync();

        var req = new CreateLoanRequest
        {
            EmployeeId = emp.Id,
            Type = LoanType.SalaryAdvance,
            TotalAmount = 7000m,
            MonthlyDeduction = 0m, // Should default to full amount for advances
            Notes = "Mid-month advance"
        };

        var result = await _sut.CreateAsync(req, "tester");

        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.TotalAmount.Should().Be(7000m);
        result.Data.MonthlyDeduction.Should().Be(7000m);
        result.Data.RemainingBalance.Should().Be(7000m);
        result.Data.Status.Should().Be(LoanStatus.Active);
    }

    [Fact]
    public async Task CreateAsync_DisbursesTermLoan_WithMonthlyInstallment()
    {
        var emp = new Employee { Id = Guid.NewGuid(), Code = "EMP-02", FullName = "Mobeen Ahmed", Status = "Active" };
        _context.Employees.Add(emp);
        await _context.SaveChangesAsync();

        var req = new CreateLoanRequest
        {
            EmployeeId = emp.Id,
            Type = LoanType.Loan,
            TotalAmount = 50000m,
            MonthlyDeduction = 5000m,
            Notes = "Company emergency loan"
        };

        var result = await _sut.CreateAsync(req, "tester");

        result.Success.Should().BeTrue();
        result.Data!.TotalAmount.Should().Be(50000m);
        result.Data.MonthlyDeduction.Should().Be(5000m);
        result.Data.RemainingBalance.Should().Be(50000m);
    }

    [Fact]
    public async Task UpdateAsync_AutoClosesLoan_WhenRemainingBalanceReachesZero()
    {
        var emp = new Employee { Id = Guid.NewGuid(), Code = "EMP-03", FullName = "Jumma Baloch", Status = "Active" };
        _context.Employees.Add(emp);
        await _context.SaveChangesAsync();

        var created = await _sut.CreateAsync(new CreateLoanRequest
        {
            EmployeeId = emp.Id,
            Type = LoanType.Loan,
            TotalAmount = 10000m,
            MonthlyDeduction = 5000m
        }, "tester");

        var loanId = created.Data!.Id;

        var updateReq = new UpdateLoanRequest
        {
            MonthlyDeduction = 5000m,
            RemainingBalance = 0m,
            Status = LoanStatus.Active // Should auto-switch to Closed because balance is 0
        };

        var updateResult = await _sut.UpdateAsync(loanId, updateReq, "tester");

        updateResult.Success.Should().BeTrue();
        updateResult.Data!.RemainingBalance.Should().Be(0m);
        updateResult.Data.Status.Should().Be(LoanStatus.Closed);
    }

    [Fact]
    public async Task GetActiveLoansForEmployeeAsync_ReturnsOnlyActiveLoansWithRemainingBalance()
    {
        var emp = new Employee { Id = Guid.NewGuid(), Code = "EMP-04", FullName = "Worker", Status = "Active" };
        _context.Employees.Add(emp);

        _context.LoansAndAdvances.AddRange(
            new LoanAndAdvance { Id = Guid.NewGuid(), EmployeeId = emp.Id, Type = LoanType.SalaryAdvance, TotalAmount = 5000, RemainingBalance = 5000, Status = LoanStatus.Active },
            new LoanAndAdvance { Id = Guid.NewGuid(), EmployeeId = emp.Id, Type = LoanType.Loan, TotalAmount = 10000, RemainingBalance = 0, Status = LoanStatus.Closed },
            new LoanAndAdvance { Id = Guid.NewGuid(), EmployeeId = emp.Id, Type = LoanType.Loan, TotalAmount = 20000, RemainingBalance = 15000, Status = LoanStatus.Suspended }
        );
        await _context.SaveChangesAsync();

        var activeLoans = await _sut.GetActiveLoansForEmployeeAsync(emp.Id);

        activeLoans.Success.Should().BeTrue();
        activeLoans.Data.Should().HaveCount(1);
        activeLoans.Data![0].RemainingBalance.Should().Be(5000);
    }
}

