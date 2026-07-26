using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SupplyChainManagement.Application.Common;
using SupplyChainManagement.Application.Definitions.DTOs;
using SupplyChainManagement.Domain.Definitions;
using SupplyChainManagement.Infrastructure.Definitions.Services;
using SupplyChainManagement.Infrastructure.Persistence;

namespace SupplyChainManagement.UnitTests.Services;

public sealed class UnitServiceTests
{
    private readonly AppDbContext _context;
    private readonly UnitService _sut;

    public UnitServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _sut = new UnitService(_context);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAll_WhenNoFilters()
    {
        _context.Units.AddRange(
            new Unit { Id = Guid.NewGuid(), Code = "KG", Name = "Kilogram", ShortName = "kg", DecimalPlaces = 2, Status = "Active", CreatedBy = "system" },
            new Unit { Id = Guid.NewGuid(), Code = "LTR", Name = "Liter", ShortName = "L", DecimalPlaces = 2, Status = "Active", CreatedBy = "system" });
        await _context.SaveChangesAsync();

        var result = await _sut.GetAllAsync(1, 20, null, null);

        result.Success.Should().BeTrue();
        result.Data.Items.Should().HaveCount(2);
        result.Data.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetAllAsync_FiltersBySearch()
    {
        _context.Units.AddRange(
            new Unit { Id = Guid.NewGuid(), Code = "KG", Name = "Kilogram", ShortName = "kg", DecimalPlaces = 2, Status = "Active", CreatedBy = "system" },
            new Unit { Id = Guid.NewGuid(), Code = "LTR", Name = "Liter", ShortName = "L", DecimalPlaces = 2, Status = "Active", CreatedBy = "system" });
        await _context.SaveChangesAsync();

        var result = await _sut.GetAllAsync(1, 20, "Liter", null);

        result.Success.Should().BeTrue();
        result.Data.Items.Should().HaveCount(1);
        result.Data.Items[0].Code.Should().Be("LTR");
    }

    [Fact]
    public async Task GetAllAsync_FiltersByStatus()
    {
        _context.Units.AddRange(
            new Unit { Id = Guid.NewGuid(), Code = "KG", Name = "Kilogram", ShortName = "kg", DecimalPlaces = 2, Status = "Active", CreatedBy = "system" },
            new Unit { Id = Guid.NewGuid(), Code = "LTR", Name = "Liter", ShortName = "L", DecimalPlaces = 2, Status = "Inactive", CreatedBy = "system" });
        await _context.SaveChangesAsync();

        var result = await _sut.GetAllAsync(1, 20, null, "Active");

        result.Success.Should().BeTrue();
        result.Data.Items.Should().HaveCount(1);
        result.Data.Items[0].Code.Should().Be("KG");
    }

    [Fact]
    public async Task GetAllAsync_Pagination_RespectsPageAndPageSize()
    {
        for (var i = 1; i <= 5; i++)
        {
            _context.Units.Add(new Unit
            {
                Id = Guid.NewGuid(),
                Code = $"U{i:D3}",
                Name = $"Unit {i}",
                ShortName = $"u{i}",
                DecimalPlaces = 2,
                Status = "Active",
                CreatedBy = "system"
            });
        }
        await _context.SaveChangesAsync();

        var result = await _sut.GetAllAsync(2, 2, null, null);

        result.Success.Should().BeTrue();
        result.Data.Items.Should().HaveCount(2);
        result.Data.Page.Should().Be(2);
        result.Data.PageSize.Should().Be(2);
        result.Data.TotalCount.Should().Be(5);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsEmpty_WhenNoData()
    {
        var result = await _sut.GetAllAsync(1, 20, null, null);

        result.Success.Should().BeTrue();
        result.Data.Items.Should().BeEmpty();
        result.Data.TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsEntity_WhenExists()
    {
        var id = Guid.NewGuid();
        _context.Units.Add(new Unit
        {
            Id = id,
            Code = "KG",
            Name = "Kilogram",
            ShortName = "kg",
            DecimalPlaces = 2,
            Status = "Active",
            CreatedBy = "system"
        });
        await _context.SaveChangesAsync();

        var result = await _sut.GetByIdAsync(id);

        result.Success.Should().BeTrue();
        result.Data.Id.Should().Be(id);
        result.Data.Name.Should().Be("Kilogram");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFail_WhenNotFound()
    {
        var result = await _sut.GetByIdAsync(Guid.NewGuid());

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task CreateAsync_CreatesEntity()
    {
        var request = new CreateUnitRequest("PCS", "Pieces", "pcs", 0, "Active");

        var result = await _sut.CreateAsync(request, "test-user");

        result.Success.Should().BeTrue();
        result.Data.Name.Should().Be("Pieces");
        result.Data.Code.Should().Be("PCS");
        result.Data.ShortName.Should().Be("pcs");
        result.Data.DecimalPlaces.Should().Be(0);

        var created = await _context.Units.FindAsync(result.Data.Id);
        created.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_UpdatesEntity_WhenExists()
    {
        var id = Guid.NewGuid();
        _context.Units.Add(new Unit
        {
            Id = id,
            Code = "KG",
            Name = "Kilogram",
            ShortName = "kg",
            DecimalPlaces = 2,
            Status = "Active",
            CreatedBy = "system"
        });
        await _context.SaveChangesAsync();

        var request = new UpdateUnitRequest("KG", "Kilogram Updated", "KGS", 3, "Inactive");
        var result = await _sut.UpdateAsync(id, request, "test-user");

        result.Success.Should().BeTrue();
        result.Data.Name.Should().Be("Kilogram Updated");
        result.Data.ShortName.Should().Be("KGS");
        result.Data.DecimalPlaces.Should().Be(3);
        result.Data.Status.Should().Be("Inactive");

        var updated = await _context.Units.FindAsync(id);
        updated!.UpdatedBy.Should().Be("test-user");
        updated.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNotFound()
    {
        var request = new UpdateUnitRequest("KG", "Kilogram", "kg", 2, "Active");

        var result = await _sut.UpdateAsync(Guid.NewGuid(), request, "test-user");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task UpdateStatusAsync_UpdatesStatus_WhenExists()
    {
        var id = Guid.NewGuid();
        _context.Units.Add(new Unit
        {
            Id = id,
            Code = "KG",
            Name = "Kilogram",
            ShortName = "kg",
            DecimalPlaces = 2,
            Status = "Active",
            CreatedBy = "system"
        });
        await _context.SaveChangesAsync();

        var result = await _sut.UpdateStatusAsync(id, new UpdateStatusRequest("Inactive"), "test-user");

        result.Success.Should().BeTrue();

        var updated = await _context.Units.FindAsync(id);
        updated!.Status.Should().Be("Inactive");
        updated.UpdatedBy.Should().Be("test-user");
    }

    [Fact]
    public async Task UpdateStatusAsync_ReturnsFail_WhenNotFound()
    {
        var result = await _sut.UpdateStatusAsync(Guid.NewGuid(), new UpdateStatusRequest("Inactive"), "test-user");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task DeleteAsync_SoftDeletes_WhenExists()
    {
        var id = Guid.NewGuid();
        _context.Units.Add(new Unit
        {
            Id = id,
            Code = "KG",
            Name = "Kilogram",
            ShortName = "kg",
            DecimalPlaces = 2,
            Status = "Active",
            CreatedBy = "system"
        });
        await _context.SaveChangesAsync();

        var result = await _sut.DeleteAsync(id, "test-user");

        result.Success.Should().BeTrue();

        var deleted = await _context.Units.FindAsync(id);
        deleted!.IsDeleted.Should().BeTrue();
        deleted.DeletedAt.Should().NotBeNull();
        deleted.UpdatedBy.Should().Be("test-user");
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFail_WhenNotFound()
    {
        var result = await _sut.DeleteAsync(Guid.NewGuid(), "test-user");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }
}
