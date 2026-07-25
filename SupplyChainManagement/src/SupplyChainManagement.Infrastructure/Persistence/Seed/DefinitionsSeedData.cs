using Microsoft.EntityFrameworkCore;
using SupplyChainManagement.Domain.Definitions;

namespace SupplyChainManagement.Infrastructure.Persistence.Seed;

public static class DefinitionsSeedData
{
    // ── ProductTypes ─────────────────────────────────────────
    public static readonly Guid ProductTypeRawId = Guid.Parse("a1b2c3d4-0001-0000-0000-000000000001");
    public static readonly Guid ProductTypeFinId = Guid.Parse("a1b2c3d4-0001-0000-0000-000000000002");
    public static readonly Guid ProductTypeSemiId = Guid.Parse("a1b2c3d4-0001-0000-0000-000000000003");
    public static readonly Guid ProductTypePackId = Guid.Parse("a1b2c3d4-0001-0000-0000-000000000004");

    // ── ProductTypeSequences ─────────────────────────────────
    public static readonly Guid SeqRawId = Guid.Parse("b2c3d4e5-0002-0000-0000-000000000001");
    public static readonly Guid SeqFinId = Guid.Parse("b2c3d4e5-0002-0000-0000-000000000002");
    public static readonly Guid SeqSemiId = Guid.Parse("b2c3d4e5-0002-0000-0000-000000000003");
    public static readonly Guid SeqPackId = Guid.Parse("b2c3d4e5-0002-0000-0000-000000000004");

    // ── Units ────────────────────────────────────────────────
    public static readonly Guid UnitPcsId = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000001");
    public static readonly Guid UnitKgId = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000002");
    public static readonly Guid UnitLtrId = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000003");
    public static readonly Guid UnitMtrId = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000004");
    public static readonly Guid UnitBoxId = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000005");
    public static readonly Guid UnitGmId = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000006");
    public static readonly Guid UnitTonId = Guid.Parse("c3d4e5f6-0003-0000-0000-000000000007");

    public static void Seed(ModelBuilder builder)
    {
        // ProductTypes
        builder.Entity<ProductType>().HasData(
            new ProductType { Id = ProductTypeRawId, Code = "RAW", Name = "Raw Material", CodePrefix = 1000000, Status = "Active", CreatedBy = "system", CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ProductType { Id = ProductTypeFinId, Code = "FIN", Name = "Finished Goods", CodePrefix = 2000000, Status = "Active", CreatedBy = "system", CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ProductType { Id = ProductTypeSemiId, Code = "SEMI", Name = "Semi Finished", CodePrefix = 3000000, Status = "Active", CreatedBy = "system", CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ProductType { Id = ProductTypePackId, Code = "PACK", Name = "Packing Material", CodePrefix = 4000000, Status = "Active", CreatedBy = "system", CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        // ProductTypeSequences
        builder.Entity<ProductTypeSequence>().HasData(
            new ProductTypeSequence { Id = SeqRawId, ProductTypeId = ProductTypeRawId, LastNumber = 0, UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ProductTypeSequence { Id = SeqFinId, ProductTypeId = ProductTypeFinId, LastNumber = 0, UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ProductTypeSequence { Id = SeqSemiId, ProductTypeId = ProductTypeSemiId, LastNumber = 0, UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ProductTypeSequence { Id = SeqPackId, ProductTypeId = ProductTypePackId, LastNumber = 0, UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Units
        builder.Entity<Unit>().HasData(
            new Unit { Id = UnitPcsId, Code = "PCS", Name = "Piece", ShortName = "PCS", DecimalPlaces = 0, Status = "Active", CreatedBy = "system", CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Unit { Id = UnitKgId, Code = "KG", Name = "Kilogram", ShortName = "KG", DecimalPlaces = 3, Status = "Active", CreatedBy = "system", CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Unit { Id = UnitLtrId, Code = "LTR", Name = "Litre", ShortName = "LTR", DecimalPlaces = 3, Status = "Active", CreatedBy = "system", CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Unit { Id = UnitMtrId, Code = "MTR", Name = "Metre", ShortName = "MTR", DecimalPlaces = 2, Status = "Active", CreatedBy = "system", CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Unit { Id = UnitBoxId, Code = "BOX", Name = "Box", ShortName = "BOX", DecimalPlaces = 0, Status = "Active", CreatedBy = "system", CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Unit { Id = UnitGmId, Code = "GM", Name = "Gram", ShortName = "GM", DecimalPlaces = 3, Status = "Active", CreatedBy = "system", CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Unit { Id = UnitTonId, Code = "TON", Name = "Ton", ShortName = "TON", DecimalPlaces = 3, Status = "Active", CreatedBy = "system", CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
