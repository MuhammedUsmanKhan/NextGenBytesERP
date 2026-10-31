using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Domain.Payroll.Enums;
using NextGenBytes.ERP.Infrastructure.Payroll.Services;
using NextGenBytes.ERP.Infrastructure.Persistence;
using Xunit;

namespace NextGenBytes.ERP.UnitTests.Payroll;

public sealed class EmployeeServiceTests
{
    private readonly AppDbContext _context;
    private readonly EmployeeService _sut;

    public EmployeeServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _sut = new EmployeeService(_context);
    }

    [Fact]
    public async Task CreateAsync_CreatesEmployeeAndActiveContract()
    {
        var request = new CreateEmployeeRequest
        {
            Code = "EMP-001",
            FullName = "Arsalan Ahmed",
            Category = "Office Staff",
            CreateContract = true,
            PayType = PayType.Monthly,
            BasicRate = 10000m,
            DailyShiftHours = 9m,
            MonthlyDivisorDays = 30,
            AbsencePolicy = AbsencePolicy.FirstDayFree_DeductRemaining,
            GraceAbsentDays = 1,
            RoundingMode = RoundingMode.Ceiling10
        };

        var result = await _sut.CreateAsync(request, "tester");

        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.FullName.Should().Be("Arsalan Ahmed");
        result.Data.ActiveContract.Should().NotBeNull();
        result.Data.ActiveContract!.BasicRate.Should().Be(10000m);
        result.Data.ActiveContract.DailyShiftHours.Should().Be(9m);
        result.Data.ActiveContract.AbsencePolicy.Should().Be(AbsencePolicy.FirstDayFree_DeductRemaining);

        var dbEmp = await _context.Employees.Include(e => e.Contracts).FirstOrDefaultAsync(e => e.Code == "EMP-001");
        dbEmp.Should().NotBeNull();
        dbEmp!.Contracts.Should().HaveCount(1);
        dbEmp.Contracts.First().IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task CreateAsync_Fails_WhenDuplicateCode()
    {
        var request1 = new CreateEmployeeRequest { Code = "EMP-999", FullName = "First" };
        var request2 = new CreateEmployeeRequest { Code = "EMP-999", FullName = "Second" };

        await _sut.CreateAsync(request1, "tester");
        var result2 = await _sut.CreateAsync(request2, "tester");

        result2.Success.Should().BeFalse();
        result2.Message.Should().Contain("already exists");
    }

    [Fact]
    public async Task GetAllAsync_FiltersByCategoryAndSearch()
    {
        await _sut.CreateAsync(new CreateEmployeeRequest { Code = "EMP-A", FullName = "Aftab Hussain", Category = "Office Staff" }, "tester");
        await _sut.CreateAsync(new CreateEmployeeRequest { Code = "EMP-B", FullName = "Abdul Rasheed", Category = "Salaries Labor" }, "tester");
        await _sut.CreateAsync(new CreateEmployeeRequest { Code = "EMP-C", FullName = "Abdul Aziz Somro", Category = "Daily Wages" }, "tester");

        var officeResult = await _sut.GetAllAsync(1, 10, null, "Office Staff");
        officeResult.Data!.Items.Should().HaveCount(1);
        officeResult.Data.Items[0].FullName.Should().Be("Aftab Hussain");

        var searchResult = await _sut.GetAllAsync(1, 10, "Abdul");
        searchResult.Data!.Items.Should().HaveCount(2);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesDetails()
    {
        var created = await _sut.CreateAsync(new CreateEmployeeRequest { Code = "EMP-UPD", FullName = "Old Name", Category = "Salaries Labor" }, "tester");
        var empId = created.Data!.Id;

        var updateReq = new UpdateEmployeeRequest
        {
            FullName = "New Name",
            Category = "Salaries Labor",
            Designation = "Senior Supervisor",
            Status = "Active"
        };

        var updateResult = await _sut.UpdateAsync(empId, updateReq, "updater");

        updateResult.Success.Should().BeTrue();
        updateResult.Data!.FullName.Should().Be("New Name");
        updateResult.Data.Designation.Should().Be("Senior Supervisor");
    }

    [Fact]
    public async Task DeleteAsync_SoftDeletesEmployee()
    {
        var created = await _sut.CreateAsync(new CreateEmployeeRequest { Code = "EMP-DEL", FullName = "To Delete" }, "tester");
        var empId = created.Data!.Id;

        var deleteResult = await _sut.DeleteAsync(empId, "admin");
        deleteResult.Success.Should().BeTrue();

        var inDb = await _context.Employees.IgnoreQueryFilters().FirstOrDefaultAsync(e => e.Id == empId);
        inDb.Should().NotBeNull();
        inDb!.IsDeleted.Should().BeTrue();
        inDb.DeletedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task AddContractAsync_DeactivatesPreviousContract()
    {
        var created = await _sut.CreateAsync(new CreateEmployeeRequest
        {
            Code = "EMP-CON",
            FullName = "Promotion Employee",
            CreateContract = true,
            BasicRate = 20000m
        }, "tester");

        var empId = created.Data!.Id;

        var newContractReq = new CreateContractRequest
        {
            PayType = PayType.Monthly,
            BasicRate = 25000m,
            DailyShiftHours = 10m,
            AbsencePolicy = AbsencePolicy.ThresholdGrace_DeductAllIfExceeded
        };

        var contractResult = await _sut.AddContractAsync(empId, newContractReq, "hr");
        contractResult.Success.Should().BeTrue();
        contractResult.Data!.BasicRate.Should().Be(25000m);
        contractResult.Data.IsActive.Should().BeTrue();

        var allContracts = await _sut.GetContractsAsync(empId);
        allContracts.Data.Should().HaveCount(2);

        var activeContracts = allContracts.Data!.Where(c => c.IsActive).ToList();
        activeContracts.Should().HaveCount(1);
        activeContracts.First().BasicRate.Should().Be(25000m);
    }

    [Fact]
    public async Task CreateAsync_Fails_WhenDuplicateBiometricDeviceId()
    {
        var request1 = new CreateEmployeeRequest { Code = "EMP-B1", FullName = "Machine User 1", BiometricDeviceId = "101" };
        var request2 = new CreateEmployeeRequest { Code = "EMP-B2", FullName = "Machine User 2", BiometricDeviceId = "101" };

        var res1 = await _sut.CreateAsync(request1, "tester");
        res1.Success.Should().BeTrue();

        var res2 = await _sut.CreateAsync(request2, "tester");
        res2.Success.Should().BeFalse();
        res2.Message.Should().Contain("Biometric Device ID '101' is already assigned");
    }

    [Fact]
    public async Task UpdateAsync_AssignsAndValidatesBiometricDeviceId()
    {
        var emp1 = await _sut.CreateAsync(new CreateEmployeeRequest { Code = "EMP-U1", FullName = "First Person", BiometricDeviceId = "201" }, "tester");
        var emp2 = await _sut.CreateAsync(new CreateEmployeeRequest { Code = "EMP-U2", FullName = "Second Person", BiometricDeviceId = "202" }, "tester");

        // Updating emp2 to existing ID "201" should fail
        var updateConflict = await _sut.UpdateAsync(emp2.Data!.Id, new UpdateEmployeeRequest
        {
            FullName = "Second Person Updated",
            BiometricDeviceId = "201"
        }, "tester");

        updateConflict.Success.Should().BeFalse();
        updateConflict.Message.Should().Contain("already assigned");

        // Updating emp2 with a unique ID "203" should succeed
        var updateSuccess = await _sut.UpdateAsync(emp2.Data!.Id, new UpdateEmployeeRequest
        {
            FullName = "Second Person Updated",
            BiometricDeviceId = "203"
        }, "tester");

        updateSuccess.Success.Should().BeTrue();
        updateSuccess.Data!.BiometricDeviceId.Should().Be("203");
    }
}

