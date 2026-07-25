using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SupplyChainManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDefinitionTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Brands",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brands", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MainCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MainCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Transporters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ContactNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transporters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Warehouses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warehouses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SubCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    MainCategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubCategories_MainCategories_MainCategoryId",
                        column: x => x.MainCategoryId,
                        principalTable: "MainCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { new Guid("e1f2a3b4-c5d6-7890-ef12-345678901234"), "View definitions", "Definitions.View" },
                    { new Guid("f2a3b4c5-d6e7-8901-f123-456789012345"), "Edit definitions", "Definitions.Edit" }
                });

            migrationBuilder.InsertData(
                table: "RolePermissions",
                columns: new[] { "PermissionId", "RoleId" },
                values: new object[,]
                {
                    { new Guid("e1f2a3b4-c5d6-7890-ef12-345678901234"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") },
                    { new Guid("f2a3b4c5-d6e7-8901-f123-456789012345"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") },
                    { new Guid("e1f2a3b4-c5d6-7890-ef12-345678901234"), new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901") },
                    { new Guid("f2a3b4c5-d6e7-8901-f123-456789012345"), new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901") },
                    { new Guid("e1f2a3b4-c5d6-7890-ef12-345678901234"), new Guid("c3d4e5f6-a7b8-9012-cdef-123456789012") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Brands_Code",
                table: "Brands",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MainCategories_Code",
                table: "MainCategories",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductGroups_Code",
                table: "ProductGroups",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubCategories_Code",
                table: "SubCategories",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubCategories_MainCategoryId",
                table: "SubCategories",
                column: "MainCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Transporters_Code",
                table: "Transporters",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Warehouses_Code",
                table: "Warehouses",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Brands");

            migrationBuilder.DropTable(
                name: "ProductGroups");

            migrationBuilder.DropTable(
                name: "SubCategories");

            migrationBuilder.DropTable(
                name: "Transporters");

            migrationBuilder.DropTable(
                name: "Warehouses");

            migrationBuilder.DropTable(
                name: "MainCategories");

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("e1f2a3b4-c5d6-7890-ef12-345678901234"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f2a3b4c5-d6e7-8901-f123-456789012345"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("e1f2a3b4-c5d6-7890-ef12-345678901234"), new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f2a3b4c5-d6e7-8901-f123-456789012345"), new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("e1f2a3b4-c5d6-7890-ef12-345678901234"), new Guid("c3d4e5f6-a7b8-9012-cdef-123456789012") });

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("e1f2a3b4-c5d6-7890-ef12-345678901234"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f2a3b4c5-d6e7-8901-f123-456789012345"));
        }
    }
}
