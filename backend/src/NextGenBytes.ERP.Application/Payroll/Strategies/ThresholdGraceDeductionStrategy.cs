using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.Strategies;

/// <summary>
/// Policy: 1 day (graceDays) free threshold. If absentDays <= graceDays, deduction is 0.
/// But if absentDays > graceDays, ALL absent days are deducted.
/// Formula: absentDays > graceDays ? (basicSalary / monthlyDivisorDays) * absentDays : 0
/// Example (Client Salaries Labor): Basic 17,500, 1 absent -> 0 PKR; 2 absents -> 1,166.67 PKR.
/// </summary>
public sealed class ThresholdGraceDeductionStrategy : IAbsenceDeductionStrategy
{
    public AbsencePolicy PolicyType => AbsencePolicy.ThresholdGrace_DeductAllIfExceeded;

    public decimal CalculateDeduction(decimal basicSalary, decimal absentDays, int graceDays, int monthlyDivisorDays)
    {
        if (monthlyDivisorDays <= 0 || absentDays <= graceDays)
            return 0m;

        var dayRate = basicSalary / monthlyDivisorDays;
        return absentDays * dayRate;
    }
}

