using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace NextGenBytes.ERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerMaster : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ContactPerson = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CountryId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CityId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Area = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CNIC = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NTN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    STRN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
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
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { new Guid("a1b2c3d4-e5f6-7890-0000-000000000005"), "View customers", "Customer.View" },
                    { new Guid("a1b2c3d4-e5f6-7890-0000-000000000006"), "Create customers", "Customer.Create" },
                    { new Guid("a1b2c3d4-e5f6-7890-0000-000000000007"), "Update customers", "Customer.Update" },
                    { new Guid("a1b2c3d4-e5f6-7890-0000-000000000008"), "Delete customers", "Customer.Delete" }
                });

            migrationBuilder.InsertData(
                table: "RolePermissions",
                columns: new[] { "PermissionId", "RoleId" },
                values: new object[,]
                {
                    { new Guid("a1b2c3d4-e5f6-7890-0000-000000000005"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") },
                    { new Guid("a1b2c3d4-e5f6-7890-0000-000000000006"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") },
                    { new Guid("a1b2c3d4-e5f6-7890-0000-000000000007"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") },
                    { new Guid("a1b2c3d4-e5f6-7890-0000-000000000008"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") },
                    { new Guid("a1b2c3d4-e5f6-7890-0000-000000000005"), new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901") },
                    { new Guid("a1b2c3d4-e5f6-7890-0000-000000000006"), new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901") },
                    { new Guid("a1b2c3d4-e5f6-7890-0000-000000000007"), new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901") },
                    { new Guid("a1b2c3d4-e5f6-7890-0000-000000000005"), new Guid("c3d4e5f6-a7b8-9012-cdef-123456789012") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_CustomerCode",
                table: "Customers",
                column: "CustomerCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("a1b2c3d4-e5f6-7890-0000-000000000005"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("a1b2c3d4-e5f6-7890-0000-000000000006"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("a1b2c3d4-e5f6-7890-0000-000000000007"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("a1b2c3d4-e5f6-7890-0000-000000000008"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("a1b2c3d4-e5f6-7890-0000-000000000005"), new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("a1b2c3d4-e5f6-7890-0000-000000000006"), new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("a1b2c3d4-e5f6-7890-0000-000000000007"), new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("a1b2c3d4-e5f6-7890-0000-000000000005"), new Guid("c3d4e5f6-a7b8-9012-cdef-123456789012") });

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7890-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7890-0000-000000000006"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7890-0000-000000000007"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7890-0000-000000000008"));
        }
    }
}
