using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Definitions.DTOs;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Infrastructure.Definitions.Services;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.UnitTests.Services;

public sealed class ProductTypeServiceTests
{
    private readonly AppDbContext _context;
    private readonly ProductTypeService _sut;

    public ProductTypeServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _sut = new ProductTypeService(_context);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAll_WhenNoFilters()
    {
        _context.ProductTypes.AddRange(
            new ProductType { Id = Guid.NewGuid(), Code = "RAW", Name = "Raw Material", CodePrefix = 1000000, Status = "Active", CreatedBy = "system" },
            new ProductType { Id = Guid.NewGuid(), Code = "FIN", Name = "Finished Goods", CodePrefix = 2000000, Status = "Active", CreatedBy = "system" });
        await _context.SaveChangesAsync();

        var result = await _sut.GetAllAsync(1, 20, null, null);

        result.Success.Should().BeTrue();
        result.Data.Items.Should().HaveCount(2);
        result.Data.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetAllAsync_FiltersBySearch()
    {
        _context.ProductTypes.AddRange(
            new ProductType { Id = Guid.NewGuid(), Code = "RAW", Name = "Raw Material", CodePrefix = 1000000, Status = "Active", CreatedBy = "system" },
            new ProductType { Id = Guid.NewGuid(), Code = "FIN", Name = "Finished Goods", CodePrefix = 2000000, Status = "Active", CreatedBy = "system" });
        await _context.SaveChangesAsync();

        var result = await _sut.GetAllAsync(1, 20, "Raw", null);

        result.Success.Should().BeTrue();
        result.Data.Items.Should().HaveCount(1);
        result.Data.Items[0].Name.Should().Be("Raw Material");
    }

    [Fact]
    public async Task GetAllAsync_FiltersByStatus()
    {
        _context.ProductTypes.AddRange(
            new ProductType { Id = Guid.NewGuid(), Code = "RAW", Name = "Raw Material", CodePrefix = 1000000, Status = "Active", CreatedBy = "system" },
            new ProductType { Id = Guid.NewGuid(), Code = "FIN", Name = "Finished Goods", CodePrefix = 2000000, Status = "Inactive", CreatedBy = "system" });
        await _context.SaveChangesAsync();

        var result = await _sut.GetAllAsync(1, 20, null, "Active");

        result.Success.Should().BeTrue();
        result.Data.Items.Should().HaveCount(1);
        result.Data.Items[0].Code.Should().Be("RAW");
    }

    [Fact]
    public async Task GetAllAsync_Pagination_RespectsPageAndPageSize()
    {
        for (var i = 1; i <= 5; i++)
        {
            _context.ProductTypes.Add(new ProductType
            {
                Id = Guid.NewGuid(),
                Code = $"T{i:D3}",
                Name = $"Type {i}",
                CodePrefix = i * 1000000,
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
        _context.ProductTypes.Add(new ProductType
        {
            Id = id,
            Code = "RAW",
            Name = "Raw Material",
            CodePrefix = 1000000,
            Status = "Active",
            CreatedBy = "system"
        });
        await _context.SaveChangesAsync();

        var result = await _sut.GetByIdAsync(id);

        result.Success.Should().BeTrue();
        result.Data.Id.Should().Be(id);
        result.Data.Name.Should().Be("Raw Material");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFail_WhenNotFound()
    {
        var result = await _sut.GetByIdAsync(Guid.NewGuid());

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task CreateAsync_CreatesEntityAndSequence()
    {
        var request = new CreateProductTypeRequest("NEW", "New Type", 5000000, "Active");

        var result = await _sut.CreateAsync(request, "test-user");

        result.Success.Should().BeTrue();
        result.Data.Name.Should().Be("New Type");
        result.Data.Code.Should().Be("NEW");

        var sequence = await _context.Sequences
            .FirstOrDefaultAsync(s => s.EntityName == "Product" && s.Scope == "NEW");
        sequence.Should().NotBeNull();
        sequence!.LastNumber.Should().Be(0);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesEntity_WhenExists()
    {
        var id = Guid.NewGuid();
        _context.ProductTypes.Add(new ProductType
        {
            Id = id,
            Code = "RAW",
            Name = "Raw Material",
            CodePrefix = 1000000,
            Status = "Active",
            CreatedBy = "system"
        });
        await _context.SaveChangesAsync();

        var request = new UpdateProductTypeRequest("RAW", "Raw Material Updated", "Inactive");
        var result = await _sut.UpdateAsync(id, request, "test-user");

        result.Success.Should().BeTrue();
        result.Data.Name.Should().Be("Raw Material Updated");
        result.Data.Status.Should().Be("Inactive");

        var updated = await _context.ProductTypes.FindAsync(id);
        updated!.UpdatedBy.Should().Be("test-user");
        updated.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNotFound()
    {
        var request = new UpdateProductTypeRequest("RAW", "Raw Material", "Active");

        var result = await _sut.UpdateAsync(Guid.NewGuid(), request, "test-user");

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task UpdateStatusAsync_UpdatesStatus_WhenExists()
    {
        var id = Guid.NewGuid();
        _context.ProductTypes.Add(new ProductType
        {
            Id = id,
            Code = "RAW",
            Name = "Raw Material",
            CodePrefix = 1000000,
            Status = "Active",
            CreatedBy = "system"
        });
        await _context.SaveChangesAsync();

        var result = await _sut.UpdateStatusAsync(id, new UpdateStatusRequest("Inactive"), "test-user");

        result.Success.Should().BeTrue();

        var updated = await _context.ProductTypes.FindAsync(id);
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
        _context.ProductTypes.Add(new ProductType
        {
            Id = id,
            Code = "RAW",
            Name = "Raw Material",
            CodePrefix = 1000000,
            Status = "Active",
            CreatedBy = "system"
        });
        await _context.SaveChangesAsync();

        var result = await _sut.DeleteAsync(id, "test-user");

        result.Success.Should().BeTrue();

        var deleted = await _context.ProductTypes.FindAsync(id);
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
