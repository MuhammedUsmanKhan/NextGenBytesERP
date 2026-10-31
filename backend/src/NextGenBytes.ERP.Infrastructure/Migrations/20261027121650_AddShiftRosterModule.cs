using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextGenBytes.ERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddShiftRosterModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsExcusedPostNightRest",
                table: "DailyAttendances",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "ShiftPayMultiplier",
                table: "DailyAttendances",
                type: "decimal(4,2)",
                precision: 4,
                scale: 2,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ShiftRosterAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    ShiftName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ShiftStart = table.Column<TimeOnly>(type: "time", nullable: false),
                    ShiftEnd = table.Column<TimeOnly>(type: "time", nullable: false),
                    ShiftDurationMinutes = table.Column<int>(type: "int", nullable: false, defaultValue: 840),
                    IsOvernightShift = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    PayMultiplier = table.Column<decimal>(type: "decimal(4,2)", precision: 4, scale: 2, nullable: false, defaultValue: 1.5m),
                    ExcuseOverlappingDayShift = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Reason = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftRosterAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShiftRosterAssignments_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ShiftRosterAssignments_EmployeeId_Date",
                table: "ShiftRosterAssignments",
                columns: new[] { "EmployeeId", "Date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShiftRosterAssignments");

            migrationBuilder.DropColumn(
                name: "IsExcusedPostNightRest",
                table: "DailyAttendances");

            migrationBuilder.DropColumn(
                name: "ShiftPayMultiplier",
                table: "DailyAttendances");
        }
    }
}
