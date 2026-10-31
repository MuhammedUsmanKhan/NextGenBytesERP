using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.Strategies;

public interface IAbsenceStrategyFactory
{
    IAbsenceDeductionStrategy GetStrategy(AbsencePolicy policy);
}

public sealed class AbsenceStrategyFactory : IAbsenceStrategyFactory
{
    private readonly IEnumerable<IAbsenceDeductionStrategy> _strategies;

    public AbsenceStrategyFactory(IEnumerable<IAbsenceDeductionStrategy> strategies)
    {
        _strategies = strategies;
    }

    public IAbsenceDeductionStrategy GetStrategy(AbsencePolicy policy)
    {
        return _strategies.FirstOrDefault(s => s.PolicyType == policy)
            ?? throw new NotImplementedException($"Absence deduction strategy for policy '{policy}' is not registered.");
    }
}

