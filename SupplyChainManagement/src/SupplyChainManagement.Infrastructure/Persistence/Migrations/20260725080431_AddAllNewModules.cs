using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SupplyChainManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAllNewModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ContactNumber",
                table: "Transporters",
                newName: "Phone");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Warehouses",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Warehouses",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Warehouses",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Warehouses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Warehouses",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Transporters",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Transporters",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPerson",
                table: "Transporters",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Transporters",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Transporters",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Transporters",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Transporters",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Transporters",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "SubCategories",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "SubCategories",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "SubCategories",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "SubCategories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "SubCategories",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "ProductGroups",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "ProductGroups",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "ProductGroups",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ProductGroups",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "ProductGroups",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "MainCategories",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "MainCategories",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "MainCategories",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "MainCategories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "MainCategories",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Brands",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Brands",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Brands",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Brands",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Brands",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Entity = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IPAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductTypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CodePrefix = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Active"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Units",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ShortName = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DecimalPlaces = table.Column<int>(type: "int", nullable: false, defaultValue: 2),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Active"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Units", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductTypeSequences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastNumber = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductTypeSequences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductTypeSequences_ProductTypes_ProductTypeId",
                        column: x => x.ProductTypeId,
                        principalTable: "ProductTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ProductTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubCategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    BrandId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProductGroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(18,4)", nullable: true),
                    ThicknessGSM = table.Column<decimal>(type: "decimal(18,4)", nullable: true),
                    ColorScheme = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Active"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Products_MainCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "MainCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Products_ProductGroups_ProductGroupId",
                        column: x => x.ProductGroupId,
                        principalTable: "ProductGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Products_ProductTypes_ProductTypeId",
                        column: x => x.ProductTypeId,
                        principalTable: "ProductTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Products_SubCategories_SubCategoryId",
                        column: x => x.SubCategoryId,
                        principalTable: "SubCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Products_Units_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Inventories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuantityOnHand = table.Column<decimal>(type: "decimal(18,4)", nullable: false, defaultValue: 0m),
                    ReservedQuantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false, defaultValue: 0m),
                    AverageCost = table.Column<decimal>(type: "decimal(18,4)", nullable: false, defaultValue: 0m),
                    MinStock = table.Column<decimal>(type: "decimal(18,4)", nullable: true),
                    MaxStock = table.Column<decimal>(type: "decimal(18,4)", nullable: true),
                    ReorderLevel = table.Column<decimal>(type: "decimal(18,4)", nullable: true),
                    AvailableQuantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false, computedColumnSql: "[QuantityOnHand] - [ReservedQuantity]"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Inventories_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Inventories_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InventoryTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TransactionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReferenceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ReferenceId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    UnitCost = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryTransactions_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryTransactions_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OpeningStocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    AverageCost = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpeningStocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpeningStocks_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OpeningStocks_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "ProductTypes",
                columns: new[] { "Id", "Code", "CodePrefix", "CreatedAt", "CreatedBy", "DeletedAt", "IsDeleted", "Name", "Status", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { new Guid("a1b2c3d4-0001-0000-0000-000000000001"), "RAW", 1000000, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", null, false, "Raw Material", "Active", null, null },
                    { new Guid("a1b2c3d4-0001-0000-0000-000000000002"), "FIN", 2000000, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", null, false, "Finished Goods", "Active", null, null },
                    { new Guid("a1b2c3d4-0001-0000-0000-000000000003"), "SEMI", 3000000, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", null, false, "Semi Finished", "Active", null, null },
                    { new Guid("a1b2c3d4-0001-0000-0000-000000000004"), "PACK", 4000000, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", null, false, "Packing Material", "Active", null, null }
                });

            migrationBuilder.InsertData(
                table: "Units",
                columns: new[] { "Id", "Code", "CreatedAt", "CreatedBy", "DeletedAt", "IsDeleted", "Name", "ShortName", "Status", "UpdatedAt", "UpdatedBy" },
                values: new object[] { new Guid("c3d4e5f6-0003-0000-0000-000000000001"), "PCS", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", null, false, "Piece", "PCS", "Active", null, null });

            migrationBuilder.InsertData(
                table: "Units",
                columns: new[] { "Id", "Code", "CreatedAt", "CreatedBy", "DecimalPlaces", "DeletedAt", "IsDeleted", "Name", "ShortName", "Status", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { new Guid("c3d4e5f6-0003-0000-0000-000000000002"), "KG", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", 3, null, false, "Kilogram", "KG", "Active", null, null },
                    { new Guid("c3d4e5f6-0003-0000-0000-000000000003"), "LTR", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", 3, null, false, "Litre", "LTR", "Active", null, null },
                    { new Guid("c3d4e5f6-0003-0000-0000-000000000004"), "MTR", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", 2, null, false, "Metre", "MTR", "Active", null, null }
                });

            migrationBuilder.InsertData(
                table: "Units",
                columns: new[] { "Id", "Code", "CreatedAt", "CreatedBy", "DeletedAt", "IsDeleted", "Name", "ShortName", "Status", "UpdatedAt", "UpdatedBy" },
                values: new object[] { new Guid("c3d4e5f6-0003-0000-0000-000000000005"), "BOX", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", null, false, "Box", "BOX", "Active", null, null });

            migrationBuilder.InsertData(
                table: "Units",
                columns: new[] { "Id", "Code", "CreatedAt", "CreatedBy", "DecimalPlaces", "DeletedAt", "IsDeleted", "Name", "ShortName", "Status", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { new Guid("c3d4e5f6-0003-0000-0000-000000000006"), "GM", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", 3, null, false, "Gram", "GM", "Active", null, null },
                    { new Guid("c3d4e5f6-0003-0000-0000-000000000007"), "TON", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", 3, null, false, "Ton", "TON", "Active", null, null }
                });

            migrationBuilder.InsertData(
                table: "ProductTypeSequences",
                columns: new[] { "Id", "ProductTypeId", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("b2c3d4e5-0002-0000-0000-000000000001"), new Guid("a1b2c3d4-0001-0000-0000-000000000001"), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("b2c3d4e5-0002-0000-0000-000000000002"), new Guid("a1b2c3d4-0001-0000-0000-000000000002"), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("b2c3d4e5-0002-0000-0000-000000000003"), new Guid("a1b2c3d4-0001-0000-0000-000000000003"), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("b2c3d4e5-0002-0000-0000-000000000004"), new Guid("a1b2c3d4-0001-0000-0000-000000000004"), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_Entity",
                table: "AuditLogs",
                column: "Entity");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityId",
                table: "AuditLogs",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Inventories_ProductId_WarehouseId",
                table: "Inventories",
                columns: new[] { "ProductId", "WarehouseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Inventories_WarehouseId",
                table: "Inventories",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_ProductId",
                table: "InventoryTransactions",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_TransactionDate",
                table: "InventoryTransactions",
                column: "TransactionDate");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_TransactionType",
                table: "InventoryTransactions",
                column: "TransactionType");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_WarehouseId",
                table: "InventoryTransactions",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_OpeningStocks_ProductId",
                table: "OpeningStocks",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_OpeningStocks_WarehouseId",
                table: "OpeningStocks",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_BrandId",
                table: "Products",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_ProductCode",
                table: "Products",
                column: "ProductCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_ProductGroupId",
                table: "Products",
                column: "ProductGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_ProductTypeId",
                table: "Products",
                column: "ProductTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_SubCategoryId",
                table: "Products",
                column: "SubCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_UnitId",
                table: "Products",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductTypes_Code",
                table: "ProductTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductTypeSequences_ProductTypeId",
                table: "ProductTypeSequences",
                column: "ProductTypeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Units_Code",
                table: "Units",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "Inventories");

            migrationBuilder.DropTable(
                name: "InventoryTransactions");

            migrationBuilder.DropTable(
                name: "OpeningStocks");

            migrationBuilder.DropTable(
                name: "ProductTypeSequences");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "ProductTypes");

            migrationBuilder.DropTable(
                name: "Units");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Transporters");

            migrationBuilder.DropColumn(
                name: "ContactPerson",
                table: "Transporters");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Transporters");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Transporters");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Transporters");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Transporters");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Transporters");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "SubCategories");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "SubCategories");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "SubCategories");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "SubCategories");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "ProductGroups");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "ProductGroups");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ProductGroups");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "ProductGroups");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "MainCategories");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "MainCategories");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "MainCategories");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "MainCategories");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Brands");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Brands");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Brands");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Brands");

            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "Transporters",
                newName: "ContactNumber");

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Warehouses",
                type: "bit",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Active");

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Transporters",
                type: "bit",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Active");

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "SubCategories",
                type: "bit",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Active");

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "ProductGroups",
                type: "bit",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Active");

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "MainCategories",
                type: "bit",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Active");

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Brands",
                type: "bit",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Active");
        }
    }
}
