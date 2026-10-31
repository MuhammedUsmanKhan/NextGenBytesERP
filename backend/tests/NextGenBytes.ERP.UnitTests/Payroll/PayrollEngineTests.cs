using NextGenBytes.ERP.Application.Payroll.Services;
using NextGenBytes.ERP.Application.Payroll.Strategies;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Domain.Payroll.Enums;
using Xunit;

namespace NextGenBytes.ERP.UnitTests.Payroll;

public class PayrollEngineTests
{
    private readonly AbsenceStrategyFactory _absenceStrategyFactory;
    private readonly PayrollCalculationEngine _engine;

    public PayrollEngineTests()
    {
        var strategies = new IAbsenceDeductionStrategy[]
        {
            new FirstDayFreeDeductionStrategy(),
            new ThresholdGraceDeductionStrategy(),
            new StandardFullDeductionStrategy()
        };
        _absenceStrategyFactory = new AbsenceStrategyFactory(strategies);
        _engine = new PayrollCalculationEngine(_absenceStrategyFactory);
    }

    [Fact]
    public void CalculatePayslip_OfficeStaff_ArsalanAhmed_MatchesExcel()
    {
        var emp = new Employee { Id = Guid.NewGuid(), Code = "EMP-001", FullName = "ARSALAN AHMED" };
        var contract = new EmployeeContract
        {
            EmployeeId = emp.Id,
            PayType = PayType.Monthly,
            BasicRate = 10000m,
            AttendanceAllowance = 0m,
            DailyShiftHours = 9.0m,
            MonthlyDivisorDays = 30,
            GraceAbsentDays = 1,
            AbsencePolicy = AbsencePolicy.FirstDayFree_DeductRemaining,
            RoundingMode = RoundingMode.Ceiling10
        };

        var attendance = new AttendanceSummary
        {
            EmployeeId = emp.Id,
            MonthYear = "2026-01",
            AbsentDays = 2,
            LateMinutes = 2140
        };

        var payslip = _engine.CalculatePayslip(emp, contract, attendance, []);

        Assert.Equal(10000m, payslip.GrossSalary);
        Assert.Equal(Math.Round(333.33m, 2), Math.Round(payslip.AbsentDeduction, 2));
        Assert.Equal(Math.Round(1320.99m, 2), Math.Round(payslip.LateDeduction, 2));
        Assert.Equal(Math.Round(8345.68m, 2), Math.Round(payslip.DueGrossSalary, 2));
        Assert.Equal(8350m, payslip.DueGrossSalaryRounded);
        Assert.Equal(8350m, payslip.NetSalary);

        // Denominations for 8350: 5000=1, 1000=3, 500=0, 100=3, 50=1, 20=0, 10=0
        Assert.NotNull(payslip.Denomination);
        Assert.Equal(1, payslip.Denomination.Note5000);
        Assert.Equal(3, payslip.Denomination.Note1000);
        Assert.Equal(0, payslip.Denomination.Note500);
        Assert.Equal(3, payslip.Denomination.Note100);
        Assert.Equal(1, payslip.Denomination.Note50);
        Assert.Equal(0, payslip.Denomination.Note20);
        Assert.Equal(0, payslip.Denomination.Note10);
        Assert.Equal(0, payslip.Denomination.CoinsRemainder);
    }

    [Fact]
    public void CalculatePayslip_OfficeStaff_YasirKhan_WithLoan_MatchesExcel()
    {
        var emp = new Employee { Id = Guid.NewGuid(), Code = "EMP-002", FullName = "YASIR KHAN" };
        var contract = new EmployeeContract
        {
            EmployeeId = emp.Id,
            PayType = PayType.Monthly,
            BasicRate = 10000m,
            DailyShiftHours = 10.0m,
            MonthlyDivisorDays = 30,
            GraceAbsentDays = 1,
            AbsencePolicy = AbsencePolicy.FirstDayFree_DeductRemaining,
            RoundingMode = RoundingMode.Ceiling10
        };

        var attendance = new AttendanceSummary
        {
            EmployeeId = emp.Id,
            MonthYear = "2026-01",
            AbsentDays = 1, // 1st day free -> 0 deduction
            LateMinutes = 617
        };

        var loan = new LoanAndAdvance
        {
            EmployeeId = emp.Id,
            Type = LoanType.Loan,
            TotalAmount = 2000m,
            MonthlyDeduction = 2000m,
            RemainingBalance = 2000m,
            Status = LoanStatus.Active
        };

        var payslip = _engine.CalculatePayslip(emp, contract, attendance, [loan]);

        Assert.Equal(10000m, payslip.GrossSalary);
        Assert.Equal(0m, payslip.AbsentDeduction);
        Assert.Equal(Math.Round(342.78m, 2), Math.Round(payslip.LateDeduction, 2));
        Assert.Equal(Math.Round(9657.22m, 2), Math.Round(payslip.DueGrossSalary, 2));
        Assert.Equal(9660m, payslip.DueGrossSalaryRounded);
        Assert.Equal(2000m, payslip.LoanDeduction);
        Assert.Equal(7660m, payslip.NetSalary);

        // 7660: 5000=1, 1000=2, 500=1, 100=1, 50=1, 20=0, 10=1
        Assert.NotNull(payslip.Denomination);
        Assert.Equal(1, payslip.Denomination.Note5000);
        Assert.Equal(2, payslip.Denomination.Note1000);
        Assert.Equal(1, payslip.Denomination.Note500);
        Assert.Equal(1, payslip.Denomination.Note100);
        Assert.Equal(1, payslip.Denomination.Note50);
        Assert.Equal(0, payslip.Denomination.Note20);
        Assert.Equal(1, payslip.Denomination.Note10);
    }

    [Fact]
    public void CalculatePayslip_SalariesLabor_AbdulRasheed_MatchesExcel()
    {
        var emp = new Employee { Id = Guid.NewGuid(), Code = "EMP-003", FullName = "ABDUL RASHEED" };
        var contract = new EmployeeContract
        {
            EmployeeId = emp.Id,
            PayType = PayType.Monthly,
            BasicRate = 17500m,
            DailyShiftHours = 10.0m,
            MonthlyDivisorDays = 30,
            GraceAbsentDays = 1,
            AbsencePolicy = AbsencePolicy.ThresholdGrace_DeductAllIfExceeded,
            RoundingMode = RoundingMode.Ceiling10
        };

        var attendance = new AttendanceSummary
        {
            EmployeeId = emp.Id,
            MonthYear = "2026-01",
            AbsentDays = 2, // Exceeds grace -> all 2 days deducted: 17500 * 2 / 30 = 1166.67
            LateMinutes = 0
        };

        var advance = new LoanAndAdvance
        {
            EmployeeId = emp.Id,
            Type = LoanType.SalaryAdvance,
            TotalAmount = 7000m,
            MonthlyDeduction = 7000m,
            RemainingBalance = 7000m,
            Status = LoanStatus.Active
        };

        var payslip = _engine.CalculatePayslip(emp, contract, attendance, [advance]);

        Assert.Equal(17500m, payslip.GrossSalary);
        Assert.Equal(Math.Round(1166.67m, 2), Math.Round(payslip.AbsentDeduction, 2));
        Assert.Equal(Math.Round(16333.33m, 2), Math.Round(payslip.DueGrossSalary, 2));
        Assert.Equal(16340m, payslip.DueGrossSalaryRounded);
        Assert.Equal(7000m, payslip.AdvanceSalaryDeduction);
        Assert.Equal(9340m, payslip.NetSalary);

        // 9340: 5000=1, 1000=4, 500=0, 100=3, 50=0, 20=2, 10=0
        Assert.NotNull(payslip.Denomination);
        Assert.Equal(1, payslip.Denomination.Note5000);
        Assert.Equal(4, payslip.Denomination.Note1000);
        Assert.Equal(0, payslip.Denomination.Note500);
        Assert.Equal(3, payslip.Denomination.Note100);
        Assert.Equal(0, payslip.Denomination.Note50);
        Assert.Equal(2, payslip.Denomination.Note20);
        Assert.Equal(0, payslip.Denomination.Note10);
    }

    [Fact]
    public void CalculatePayslip_DailyWages_ShahbazAslam_MatchesExcel()
    {
        var emp = new Employee { Id = Guid.NewGuid(), Code = "EMP-004", FullName = "SHAHBAZ ASLAM" };
        var contract = new EmployeeContract
        {
            EmployeeId = emp.Id,
            PayType = PayType.DailyWage,
            BasicRate = 1650m,
            DailyShiftHours = 10.0m,
            RoundingMode = RoundingMode.Ceiling10
        };

        var attendance = new AttendanceSummary
        {
            EmployeeId = emp.Id,
            MonthYear = "2026-01",
            DaysPresent = 27,
            LateMinutes = 765
        };

        var loan = new LoanAndAdvance
        {
            EmployeeId = emp.Id,
            Type = LoanType.Loan,
            TotalAmount = 5000m,
            MonthlyDeduction = 5000m,
            RemainingBalance = 5000m,
            Status = LoanStatus.Active
        };

        var advance = new LoanAndAdvance
        {
            EmployeeId = emp.Id,
            Type = LoanType.SalaryAdvance,
            TotalAmount = 33500m,
            MonthlyDeduction = 33500m,
            RemainingBalance = 33500m,
            Status = LoanStatus.Active
        };

        var payslip = _engine.CalculatePayslip(emp, contract, attendance, [loan, advance]);

        Assert.Equal(44550m, payslip.GrossSalary); // 27 * 1650
        Assert.Equal(Math.Round(2103.75m, 2), Math.Round(payslip.LateDeduction, 2)); // 765 * (1650/600)
        Assert.Equal(Math.Round(42446.25m, 2), Math.Round(payslip.DueGrossSalary, 2));
        Assert.Equal(42450m, payslip.DueGrossSalaryRounded);
        Assert.Equal(5000m, payslip.LoanDeduction);
        Assert.Equal(33500m, payslip.AdvanceSalaryDeduction);
        Assert.Equal(3950m, payslip.NetSalary); // 42450 - 38500 = 3950

        // 3950: 5000=0, 1000=3, 500=1, 100=4, 50=1, 20=0, 10=0
        Assert.NotNull(payslip.Denomination);
        Assert.Equal(0, payslip.Denomination.Note5000);
        Assert.Equal(3, payslip.Denomination.Note1000);
        Assert.Equal(1, payslip.Denomination.Note500);
        Assert.Equal(4, payslip.Denomination.Note100);
        Assert.Equal(1, payslip.Denomination.Note50);
        Assert.Equal(0, payslip.Denomination.Note20);
        Assert.Equal(0, payslip.Denomination.Note10);
    }

    [Fact]
    public void CalculatePayslip_SalariedLabor_NightAndOvertime_AbdulRasheed_MatchesExcel()
    {
        var emp = new Employee { Id = Guid.NewGuid(), Code = "EMP-003", FullName = "ABDUL RASHEED" };
        var contract = new EmployeeContract
        {
            EmployeeId = emp.Id,
            PayType = PayType.Monthly,
            BasicRate = 17500m,
            DailyShiftHours = 10.0m,
            MonthlyDivisorDays = 30,
            OvertimeMultiplier = 1.5m,
            RoundingMode = RoundingMode.Ceiling10
        };

        var attendance = new AttendanceSummary
        {
            EmployeeId = emp.Id,
            MonthYear = "2026-01",
            NightShiftsCount = 7,
            NightShiftMinutes = 5880,
            OvertimeMinutes = 1440
        };

        var payslip = _engine.CalculatePayslip(emp, contract, attendance, []);

        Assert.Equal(8575m, payslip.NightShiftAmount);
        Assert.Equal(2100m, payslip.OvertimeAmount);
    }

    [Fact]
    public void CalculateDenominations_StandardDenominations_AreGreedyOptimal()
    {
        var denominations = _engine.CalculateDenominations(1351990m);

        var reconstructed = (denominations.Note5000 * 5000)
            + (denominations.Note1000 * 1000)
            + (denominations.Note500 * 500)
            + (denominations.Note100 * 100)
            + (denominations.Note50 * 50)
            + (denominations.Note20 * 20)
            + (denominations.Note10 * 10)
            + denominations.CoinsRemainder;

        Assert.Equal(1351990, reconstructed);
    }
}
