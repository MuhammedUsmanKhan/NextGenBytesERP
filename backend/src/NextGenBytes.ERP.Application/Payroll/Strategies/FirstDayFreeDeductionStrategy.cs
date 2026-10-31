using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.Strategies;

/// <summary>
/// Policy: 1st day (graceDays) free. If absentDays > graceDays, only (absentDays - graceDays) are deducted.
/// Formula: (basicSalary / monthlyDivisorDays) * Max(0, absentDays - graceDays)
/// Example (Client Office Staff): Basic 10,000, 2 absents -> 1 day deducted = 333.33 PKR.
/// </summary>
public sealed class FirstDayFreeDeductionStrategy : IAbsenceDeductionStrategy
{
    public AbsencePolicy PolicyType => AbsencePolicy.FirstDayFree_DeductRemaining;

    public decimal CalculateDeduction(decimal basicSalary, decimal absentDays, int graceDays, int monthlyDivisorDays)
    {
        if (monthlyDivisorDays <= 0 || absentDays <= graceDays)
            return 0m;

        var dayRate = basicSalary / monthlyDivisorDays;
        var deductibleDays = Math.Max(0m, absentDays - graceDays);
        return deductibleDays * dayRate;
    }
}

