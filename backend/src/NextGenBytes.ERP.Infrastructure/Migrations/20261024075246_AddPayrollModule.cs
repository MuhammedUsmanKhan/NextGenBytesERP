using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextGenBytes.ERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPayrollModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CNIC = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DepartmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Designation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Salaries Labor"),
                    DateOfJoining = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_Employees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Employees_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PayrollRuns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MonthYear = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    DepartmentCategory = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RunDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TotalGrossSalary = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    TotalDeductions = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    TotalDueGross = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    TotalDueGrossRounded = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    TotalLoansAndAdvances = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    TotalNetSalary = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ApprovedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayrollRuns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceSummaries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MonthYear = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    DaysPresent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    AbsentDays = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    LateMinutes = table.Column<int>(type: "int", nullable: false),
                    OvertimeHours = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    OvertimeMinutes = table.Column<int>(type: "int", nullable: false),
                    NightShiftsCount = table.Column<int>(type: "int", nullable: false),
                    NightShiftMinutes = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceSummaries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttendanceSummaries_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeContracts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PayType = table.Column<int>(type: "int", nullable: false),
                    DisbursementType = table.Column<int>(type: "int", nullable: false),
                    BasicRate = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AttendanceAllowance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    OtherAllowances = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    MonthlyDivisorDays = table.Column<int>(type: "int", nullable: false, defaultValue: 30),
                    DailyShiftHours = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 10m),
                    NightShiftMinutes = table.Column<int>(type: "int", nullable: false, defaultValue: 840),
                    AbsencePolicy = table.Column<int>(type: "int", nullable: false),
                    GraceAbsentDays = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    OvertimeEligible = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    OvertimeMultiplier = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 1.5m),
                    RoundingMode = table.Column<int>(type: "int", nullable: false),
                    BankName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BankAccountNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeContracts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeContracts_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LoansAndAdvances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MonthlyDeduction = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    RemainingBalance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DisbursedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoansAndAdvances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoansAndAdvances_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payslips",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PayrollRunId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeNameSnapshot = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DepartmentSnapshot = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PayTypeSnapshot = table.Column<int>(type: "int", nullable: false),
                    DisbursementType = table.Column<int>(type: "int", nullable: false),
                    BasicRate = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AttendanceAllowance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    OtherAllowances = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    GrossSalary = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DaysPresent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    AbsentDays = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    AbsentDeduction = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    LateMinutes = table.Column<int>(type: "int", nullable: false),
                    LateDeduction = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    NightShiftsCount = table.Column<int>(type: "int", nullable: false),
                    NightShiftMinutes = table.Column<int>(type: "int", nullable: false),
                    NightShiftAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    OvertimeMinutes = table.Column<int>(type: "int", nullable: false),
                    OvertimeAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalDeductions = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DueGrossSalary = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DueGrossSalaryRounded = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    LoanDeduction = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AdvanceSalaryDeduction = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalLess = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    NetSalary = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payslips", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payslips_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payslips_PayrollRuns_PayrollRunId",
                        column: x => x.PayrollRunId,
                        principalTable: "PayrollRuns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PayslipDenominations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PayslipId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Note5000 = table.Column<int>(type: "int", nullable: false),
                    Note1000 = table.Column<int>(type: "int", nullable: false),
                    Note500 = table.Column<int>(type: "int", nullable: false),
                    Note100 = table.Column<int>(type: "int", nullable: false),
                    Note50 = table.Column<int>(type: "int", nullable: false),
                    Note20 = table.Column<int>(type: "int", nullable: false),
                    Note10 = table.Column<int>(type: "int", nullable: false),
                    CoinsRemainder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayslipDenominations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PayslipDenominations_Payslips_PayslipId",
                        column: x => x.PayslipId,
                        principalTable: "Payslips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceSummaries_EmployeeId_MonthYear",
                table: "AttendanceSummaries",
                columns: new[] { "EmployeeId", "MonthYear" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeContracts_EmployeeId_IsActive",
                table: "EmployeeContracts",
                columns: new[] { "EmployeeId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_Code",
                table: "Employees",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DepartmentId",
                table: "Employees",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_LoansAndAdvances_EmployeeId_Status",
                table: "LoansAndAdvances",
                columns: new[] { "EmployeeId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_PayrollRuns_MonthYear_DepartmentCategory",
                table: "PayrollRuns",
                columns: new[] { "MonthYear", "DepartmentCategory" });

            migrationBuilder.CreateIndex(
                name: "IX_PayslipDenominations_PayslipId",
                table: "PayslipDenominations",
                column: "PayslipId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payslips_EmployeeId",
                table: "Payslips",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Payslips_PayrollRunId_EmployeeId",
                table: "Payslips",
                columns: new[] { "PayrollRunId", "EmployeeId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttendanceSummaries");

            migrationBuilder.DropTable(
                name: "EmployeeContracts");

            migrationBuilder.DropTable(
                name: "LoansAndAdvances");

            migrationBuilder.DropTable(
                name: "PayslipDenominations");

            migrationBuilder.DropTable(
                name: "Payslips");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "PayrollRuns");
        }
    }
}
