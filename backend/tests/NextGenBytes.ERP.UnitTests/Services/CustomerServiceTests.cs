using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Moq;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Common.Interfaces;
using NextGenBytes.ERP.Application.Definitions.DTOs;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Infrastructure.Definitions.Services;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.UnitTests.Services;

public sealed class CustomerServiceTests
{
    private const string CustomerCodePrefix = "10-01-03-";

    private readonly AppDbContext _context;
    private readonly Mock<ISequenceService> _sequenceServiceMock;
    private readonly CustomerService _sut;

    public CustomerServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        _context = new AppDbContext(options);
        _sequenceServiceMock = new Mock<ISequenceService>();
        _sut = new CustomerService(_context, _sequenceServiceMock.Object);
    }

    private static CreateCustomerRequest ValidRequest() => new(
        CompanyName: "Acme Ltd",
        ContactPerson: null,
        Email: null,
        CountryId: null,
        CityId: null,
        PostalCode: null,
        Address: null,
        Area: null,
        CNIC: null,
        NTN: null,
        STRN: null,
        Status: "Active");

    private static Customer CreateCustomer(string companyName = "Acme Ltd", string status = "Active")
    {
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            CustomerCode = $"{CustomerCodePrefix}000001",
            CompanyName = companyName,
            Status = status,
            CreatedBy = "system",
            CreatedAt = DateTime.UtcNow
        };
        return customer;
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAll_WhenNoFilters()
    {
        _context.Customers.AddRange(
            CreateCustomer("Acme Ltd"),
            CreateCustomer("Globex Corp"));
        await _context.SaveChangesAsync();

        var result = await _sut.GetAllAsync(1, 20, null, null);

        result.Success.Should().BeTrue();
        result.Data!.Items.Should().HaveCount(2);
        result.Data.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetAllAsync_FiltersBySearch()
    {
        _context.Customers.AddRange(
            CreateCustomer("Acme Ltd"),
            CreateCustomer("Globex Corp"));
        await _context.SaveChangesAsync();

        var result = await _sut.GetAllAsync(1, 20, "Globex", null);

        result.Success.Should().BeTrue();
        result.Data!.Items.Should().HaveCount(1);
        result.Data.Items[0].CompanyName.Should().Be("Globex Corp");
    }

    [Fact]
    public async Task GetAllAsync_FiltersByStatus()
    {
        _context.Customers.AddRange(
            CreateCustomer("Acme Ltd", "Active"),
            CreateCustomer("Globex Corp", "Inactive"));
        await _context.SaveChangesAsync();

        var result = await _sut.GetAllAsync(1, 20, null, "Inactive");

        result.Success.Should().BeTrue();
        result.Data!.Items.Should().HaveCount(1);
        result.Data.Items[0].CompanyName.Should().Be("Globex Corp");
    }

    [Fact]
    public async Task GetAllAsync_Paginates()
    {
        _context.Customers.AddRange(
            CreateCustomer("Customer One"),
            CreateCustomer("Customer Two"),
            CreateCustomer("Customer Three"));
        await _context.SaveChangesAsync();

        var result = await _sut.GetAllAsync(1, 2, null, null);

        result.Success.Should().BeTrue();
        result.Data!.Items.Should().HaveCount(2);
        result.Data.TotalCount.Should().Be(3);
        result.Data.TotalPages.Should().Be(2);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsCustomer()
    {
        var customer = CreateCustomer();
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        var result = await _sut.GetByIdAsync(customer.Id);

        result.Success.Should().BeTrue();
        result.Data!.CompanyName.Should().Be("Acme Ltd");
        result.Data.CustomerCode.Should().Be($"{CustomerCodePrefix}000001");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFail_WhenNotFound()
    {
        var result = await _sut.GetByIdAsync(Guid.NewGuid());

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task CreateAsync_GeneratesCustomerCode()
    {
        _sequenceServiceMock
            .Setup(x => x.GetNextSequenceAsync("Customer", "DEFAULT", It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var result = await _sut.CreateAsync(ValidRequest(), "admin");

        result.Success.Should().BeTrue();
        result.Data!.CustomerCode.Should().Be("10-01-03-000001");
        result.Data.CompanyName.Should().Be("Acme Ltd");
        result.Data.CreatedBy.Should().Be("admin");
    }

    [Fact]
    public async Task CreateAsync_SequentialCodes_AreZeroPadded()
    {
        var next = 0;
        _sequenceServiceMock
            .Setup(x => x.GetNextSequenceAsync("Customer", "DEFAULT", It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => ++next);

        var first = await _sut.CreateAsync(ValidRequest(), "admin");
        var second = await _sut.CreateAsync(ValidRequest(), "admin");
        var third = await _sut.CreateAsync(ValidRequest(), "admin");

        first.Data!.CustomerCode.Should().Be("10-01-03-000001");
        second.Data!.CustomerCode.Should().Be("10-01-03-000002");
        third.Data!.CustomerCode.Should().Be("10-01-03-000003");
    }

    [Fact]
    public async Task UpdateAsync_KeepsCustomerCodeUnchanged()
    {
        var customer = CreateCustomer();
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        var request = new UpdateCustomerRequest(
            CompanyName: "Acme Ltd (Updated)",
            ContactPerson: null,
            Email: null,
            CountryId: null,
            CityId: null,
            PostalCode: null,
            Address: null,
            Area: null,
            CNIC: null,
            NTN: null,
            STRN: null,
            Status: "Inactive");

        var result = await _sut.UpdateAsync(customer.Id, request, "editor");

        result.Success.Should().BeTrue();
        result.Data!.CustomerCode.Should().Be($"{CustomerCodePrefix}000001");
        result.Data.CompanyName.Should().Be("Acme Ltd (Updated)");
        result.Data.Status.Should().Be("Inactive");
        result.Data.UpdatedBy.Should().Be("editor");
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNotFound()
    {
        var result = await _sut.UpdateAsync(Guid.NewGuid(), new UpdateCustomerRequest(
            CompanyName: "Acme Ltd",
            ContactPerson: null,
            Email: null,
            CountryId: null,
            CityId: null,
            PostalCode: null,
            Address: null,
            Area: null,
            CNIC: null,
            NTN: null,
            STRN: null,
            Status: "Active"), "editor");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task UpdateStatusAsync_UpdatesStatus()
    {
        var customer = CreateCustomer(status: "Active");
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        var result = await _sut.UpdateStatusAsync(customer.Id, new UpdateStatusRequest("Inactive"), "editor");

        result.Success.Should().BeTrue();
        _context.Customers.First().Status.Should().Be("Inactive");
    }

    [Fact]
    public async Task UpdateStatusAsync_ReturnsFail_WhenNotFound()
    {
        var result = await _sut.UpdateStatusAsync(Guid.NewGuid(), new UpdateStatusRequest("Inactive"), "editor");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task DeleteAsync_SoftDeletes()
    {
        var customer = CreateCustomer();
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        var result = await _sut.DeleteAsync(customer.Id, "admin");

        result.Success.Should().BeTrue();
        _context.Customers.IgnoreQueryFilters().Single().IsDeleted.Should().BeTrue();
        _context.Customers.IgnoreQueryFilters().Single().DeletedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFail_WhenNotFound()
    {
        var result = await _sut.DeleteAsync(Guid.NewGuid(), "admin");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task GetNextCustomerCodeAsync_PeeksSequence()
    {
        _sequenceServiceMock
            .Setup(x => x.PeekNextSequenceAsync("Customer", "DEFAULT", It.IsAny<CancellationToken>()))
            .ReturnsAsync(5);

        var result = await _sut.GetNextCustomerCodeAsync();

        result.Success.Should().BeTrue();
        result.Data!.CustomerCode.Should().Be("10-01-03-000005");
        _sequenceServiceMock.Verify(
            x => x.PeekNextSequenceAsync("Customer", "DEFAULT", It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
