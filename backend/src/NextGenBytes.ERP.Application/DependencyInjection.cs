using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using NextGenBytes.ERP.Application.Payroll.Interfaces;
using NextGenBytes.ERP.Application.Payroll.Services;
using NextGenBytes.ERP.Application.Payroll.Strategies;

namespace NextGenBytes.ERP.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        // Payroll Absence Deduction Strategies
        services.AddTransient<IAbsenceDeductionStrategy, FirstDayFreeDeductionStrategy>();
        services.AddTransient<IAbsenceDeductionStrategy, ThresholdGraceDeductionStrategy>();
        services.AddTransient<IAbsenceDeductionStrategy, StandardFullDeductionStrategy>();
        services.AddTransient<IAbsenceStrategyFactory, AbsenceStrategyFactory>();
        services.AddScoped<IPayrollCalculationEngine, PayrollCalculationEngine>();

        return services;
    }
}
