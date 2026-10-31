using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.Strategies;

public interface IAbsenceDeductionStrategy
{
    AbsencePolicy PolicyType { get; }
    decimal CalculateDeduction(decimal basicSalary, decimal absentDays, int graceDays, int monthlyDivisorDays);
}

