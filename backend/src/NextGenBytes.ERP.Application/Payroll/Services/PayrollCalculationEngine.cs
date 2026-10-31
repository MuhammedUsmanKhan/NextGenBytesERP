using NextGenBytes.ERP.Application.Payroll.Interfaces;
using NextGenBytes.ERP.Application.Payroll.Strategies;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.Services;

public sealed class PayrollCalculationEngine : IPayrollCalculationEngine
{
    private readonly IAbsenceStrategyFactory _absenceStrategyFactory;

    public PayrollCalculationEngine(IAbsenceStrategyFactory absenceStrategyFactory)
    {
        _absenceStrategyFactory = absenceStrategyFactory;
    }

    public Payslip CalculatePayslip(
        Employee employee,
        EmployeeContract contract,
        AttendanceSummary? attendance,
        List<LoanAndAdvance> activeLoans)
    {
        var payslip = new Payslip
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            Employee = employee,
            EmployeeNameSnapshot = employee.FullName,
            DepartmentSnapshot = employee.Department?.Name ?? employee.Category,
            PayTypeSnapshot = contract.PayType,
            DisbursementType = contract.DisbursementType,
            BasicRate = contract.BasicRate,
            AttendanceAllowance = contract.AttendanceAllowance,
            OtherAllowances = contract.OtherAllowances,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        // Attendance inputs
        var daysPresent = attendance?.DaysPresent ?? 0m;
        var absentDays = attendance?.AbsentDays ?? 0m;
        var lateMinutes = attendance?.LateMinutes ?? 0;
        var nightShiftsCount = attendance?.NightShiftsCount ?? 0;
        var nightShiftMinutes = attendance?.NightShiftMinutes ?? 0;
        if (nightShiftMinutes == 0 && nightShiftsCount > 0)
        {
            nightShiftMinutes = nightShiftsCount * contract.NightShiftMinutes;
        }
        var overtimeMinutes = attendance?.OvertimeMinutes ?? 0;

        payslip.DaysPresent = daysPresent;
        payslip.AbsentDays = absentDays;
        payslip.LateMinutes = lateMinutes;
        payslip.NightShiftsCount = nightShiftsCount;
        payslip.NightShiftMinutes = nightShiftMinutes;
        payslip.OvertimeMinutes = overtimeMinutes;

        // 1. Gross Salary
        if (contract.PayType == PayType.DailyWage)
        {
            payslip.GrossSalary = (daysPresent * contract.BasicRate) + contract.AttendanceAllowance + contract.OtherAllowances;
        }
        else
        {
            payslip.GrossSalary = contract.BasicRate + contract.AttendanceAllowance + contract.OtherAllowances;
        }

        // 2. Minute Rate for late deduction & overtime / nights
        var divisorDays = contract.MonthlyDivisorDays > 0 ? contract.MonthlyDivisorDays : 30;
        var shiftHours = contract.DailyShiftHours > 0 ? contract.DailyShiftHours : 10m;
        var shiftMinutesInMonth = contract.PayType == PayType.DailyWage
            ? shiftHours * 60m
            : divisorDays * shiftHours * 60m;

        var minuteRate = shiftMinutesInMonth > 0 ? contract.BasicRate / shiftMinutesInMonth : 0m;

        // 3. Absence Deduction (Only for monthly salaried staff)
        if (contract.PayType == PayType.Monthly && absentDays > 0)
        {
            var strategy = _absenceStrategyFactory.GetStrategy(contract.AbsencePolicy);
            payslip.AbsentDeduction = strategy.CalculateDeduction(
                contract.BasicRate,
                absentDays,
                contract.GraceAbsentDays,
                divisorDays);
        }
        else
        {
            payslip.AbsentDeduction = 0m;
        }

        // 4. Late Deduction
        payslip.LateDeduction = lateMinutes > 0 ? lateMinutes * minuteRate : 0m;
        payslip.TotalDeductions = payslip.AbsentDeduction + payslip.LateDeduction;

        // 5. Nights & Overtime additions (Multiplied by OvertimeMultiplier, e.g. 1.5)
        var otMultiplier = contract.OvertimeMultiplier > 0 ? contract.OvertimeMultiplier : 1.5m;
        var otRatePerMinute = minuteRate * otMultiplier;

        payslip.NightShiftAmount = nightShiftMinutes > 0 ? nightShiftMinutes * otRatePerMinute : 0m;
        payslip.OvertimeAmount = overtimeMinutes > 0 ? overtimeMinutes * otRatePerMinute : 0m;

        // 6. Due Gross Salary
        payslip.DueGrossSalary = payslip.GrossSalary + payslip.NightShiftAmount + payslip.OvertimeAmount - payslip.TotalDeductions;

        // 7. Due Gross Rounded (Spreadsheet-proven Ceiling to nearest 10)
        payslip.DueGrossSalaryRounded = RoundDueGross(payslip.DueGrossSalary, contract.RoundingMode);

        // 8. Loans & Advances Deductions
        decimal totalAdv = 0m;
        decimal totalLoan = 0m;

        foreach (var loan in activeLoans.Where(l => l.EmployeeId == employee.Id && l.Status == LoanStatus.Active && l.RemainingBalance > 0))
        {
            var deductible = Math.Min(loan.RemainingBalance, loan.MonthlyDeduction);
            if (loan.Type == LoanType.SalaryAdvance)
                totalAdv += deductible;
            else
                totalLoan += deductible;
        }

        payslip.AdvanceSalaryDeduction = totalAdv;
        payslip.LoanDeduction = totalLoan;
        payslip.TotalLess = totalAdv + totalLoan;

        // 9. Net Salary
        payslip.NetSalary = payslip.DueGrossSalaryRounded - payslip.TotalLess;

        // 10. Greedy PKR Denominations
        payslip.Denomination = CalculateDenominations(payslip.NetSalary);
        payslip.Denomination.PayslipId = payslip.Id;
        payslip.Denomination.Payslip = payslip;

        return payslip;
    }

    public PayslipDenomination CalculateDenominations(decimal netSalary)
    {
        var denom = new PayslipDenomination { Id = Guid.NewGuid() };

        if (netSalary <= 0)
            return denom;

        var remaining = (long)Math.Round(netSalary, MidpointRounding.AwayFromZero);

        denom.Note5000 = (int)(remaining / 5000);
        remaining %= 5000;

        denom.Note1000 = (int)(remaining / 1000);
        remaining %= 1000;

        denom.Note500 = (int)(remaining / 500);
        remaining %= 500;

        denom.Note100 = (int)(remaining / 100);
        remaining %= 100;

        denom.Note50 = (int)(remaining / 50);
        remaining %= 50;

        denom.Note20 = (int)(remaining / 20);
        remaining %= 20;

        denom.Note10 = (int)(remaining / 10);
        remaining %= 10;

        denom.CoinsRemainder = (int)remaining;
        return denom;
    }

    private static decimal RoundDueGross(decimal amount, RoundingMode mode)
    {
        return mode switch
        {
            RoundingMode.Ceiling10 => Math.Ceiling(amount / 10m) * 10m,
            RoundingMode.Nearest10 => Math.Round(amount / 10m, MidpointRounding.AwayFromZero) * 10m,
            _ => amount
        };
    }
}

