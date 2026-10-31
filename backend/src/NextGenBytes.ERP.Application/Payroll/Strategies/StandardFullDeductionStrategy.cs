using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.Strategies;

/// <summary>
/// Policy: Every absent day is deducted with zero grace period.
/// Formula: (basicSalary / monthlyDivisorDays) * absentDays
/// </summary>
public sealed class StandardFullDeductionStrategy : IAbsenceDeductionStrategy
{
    public AbsencePolicy PolicyType => AbsencePolicy.StandardFullDeduction;

    public decimal CalculateDeduction(decimal basicSalary, decimal absentDays, int graceDays, int monthlyDivisorDays)
    {
        if (monthlyDivisorDays <= 0 || absentDays <= 0)
            return 0m;

        var dayRate = basicSalary / monthlyDivisorDays;
        return absentDays * dayRate;
    }
}

