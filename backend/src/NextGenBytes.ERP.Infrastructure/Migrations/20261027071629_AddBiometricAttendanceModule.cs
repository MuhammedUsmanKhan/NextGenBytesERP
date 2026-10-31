using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextGenBytes.ERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBiometricAttendanceModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BiometricDeviceId",
                table: "Employees",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ShiftDefinitionId",
                table: "Employees",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CompanyCalendarHolidays",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsRecurringYearly = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    RestDayOfWeek = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyCalendarHolidays", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DailyAttendances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    FirstPunchIn = table.Column<TimeOnly>(type: "time", nullable: true),
                    LastPunchOut = table.Column<TimeOnly>(type: "time", nullable: true),
                    TotalPunches = table.Column<int>(type: "int", nullable: false),
                    LateMinutes = table.Column<int>(type: "int", nullable: false),
                    EarlyLeaveMinutes = table.Column<int>(type: "int", nullable: false),
                    WorkedMinutes = table.Column<int>(type: "int", nullable: false),
                    OvertimeMinutes = table.Column<int>(type: "int", nullable: false),
                    IsNightShift = table.Column<bool>(type: "bit", nullable: false),
                    IsAbsent = table.Column<bool>(type: "bit", nullable: false),
                    IsWeekend = table.Column<bool>(type: "bit", nullable: false),
                    IsHoliday = table.Column<bool>(type: "bit", nullable: false),
                    HasException = table.Column<bool>(type: "bit", nullable: false),
                    IsSinglePunchMissing = table.Column<bool>(type: "bit", nullable: false),
                    ExceptionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsResolved = table.Column<bool>(type: "bit", nullable: false),
                    ResolvedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolutionNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Source = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "DAT_IMPORT"),
                    ImportBatchId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyAttendances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyAttendances_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RawPunchLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BiometricDeviceId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PunchTimestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TerminalId = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    PunchState = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    WorkCode = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ImportBatchId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsDuplicateFiltered = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RawPunchLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RawPunchLogs_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ShiftDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ShiftStart = table.Column<TimeOnly>(type: "time", nullable: false),
                    ShiftEnd = table.Column<TimeOnly>(type: "time", nullable: false),
                    ShiftDurationMinutes = table.Column<int>(type: "int", nullable: false, defaultValue: 540),
                    GraceLateMinutes = table.Column<int>(type: "int", nullable: false, defaultValue: 10),
                    GraceMode = table.Column<int>(type: "int", nullable: false),
                    IsOvernightShift = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    NightShiftStart = table.Column<TimeOnly>(type: "time", nullable: false),
                    NightShiftEnd = table.Column<TimeOnly>(type: "time", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftDefinitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShiftDefinitions_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_BiometricDeviceId",
                table: "Employees",
                column: "BiometricDeviceId",
                unique: true,
                filter: "[BiometricDeviceId] IS NOT NULL AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_ShiftDefinitionId",
                table: "Employees",
                column: "ShiftDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCalendarHolidays_Date",
                table: "CompanyCalendarHolidays",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_DailyAttendances_Date_HasException_IsResolved",
                table: "DailyAttendances",
                columns: new[] { "Date", "HasException", "IsResolved" });

            migrationBuilder.CreateIndex(
                name: "IX_DailyAttendances_EmployeeId_Date",
                table: "DailyAttendances",
                columns: new[] { "EmployeeId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RawPunchLogs_BiometricDeviceId_PunchTimestamp",
                table: "RawPunchLogs",
                columns: new[] { "BiometricDeviceId", "PunchTimestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_RawPunchLogs_EmployeeId",
                table: "RawPunchLogs",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_RawPunchLogs_ImportBatchId",
                table: "RawPunchLogs",
                column: "ImportBatchId");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftDefinitions_DepartmentId",
                table: "ShiftDefinitions",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_ShiftDefinitions_ShiftDefinitionId",
                table: "Employees",
                column: "ShiftDefinitionId",
                principalTable: "ShiftDefinitions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_ShiftDefinitions_ShiftDefinitionId",
                table: "Employees");

            migrationBuilder.DropTable(
                name: "CompanyCalendarHolidays");

            migrationBuilder.DropTable(
                name: "DailyAttendances");

            migrationBuilder.DropTable(
                name: "RawPunchLogs");

            migrationBuilder.DropTable(
                name: "ShiftDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_Employees_BiometricDeviceId",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_ShiftDefinitionId",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "BiometricDeviceId",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "ShiftDefinitionId",
                table: "Employees");
        }
    }
}
