using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextGenBytes.ERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendanceThreeTierProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsBaseWageApproved",
                table: "DailyAttendances",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsOvertimeApproved",
                table: "DailyAttendances",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PendingOvertimeMinutes",
                table: "DailyAttendances",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "PendingPayMultiplier",
                table: "DailyAttendances",
                type: "decimal(4,2)",
                precision: 4,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PendingExceptionsCount",
                table: "AttendanceSummaries",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PendingOvertimeMinutes",
                table: "AttendanceSummaries",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsBaseWageApproved",
                table: "DailyAttendances");

            migrationBuilder.DropColumn(
                name: "IsOvertimeApproved",
                table: "DailyAttendances");

            migrationBuilder.DropColumn(
                name: "PendingOvertimeMinutes",
                table: "DailyAttendances");

            migrationBuilder.DropColumn(
                name: "PendingPayMultiplier",
                table: "DailyAttendances");

            migrationBuilder.DropColumn(
                name: "PendingExceptionsCount",
                table: "AttendanceSummaries");

            migrationBuilder.DropColumn(
                name: "PendingOvertimeMinutes",
                table: "AttendanceSummaries");
        }
    }
}
