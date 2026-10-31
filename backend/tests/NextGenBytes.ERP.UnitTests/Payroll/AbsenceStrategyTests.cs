using NextGenBytes.ERP.Application.Payroll.Strategies;
using NextGenBytes.ERP.Domain.Payroll.Enums;
using Xunit;

namespace NextGenBytes.ERP.UnitTests.Payroll;

public class AbsenceStrategyTests
{
    [Theory]
    [InlineData(10000, 0, 1, 30, 0)]
    [InlineData(10000, 1, 1, 30, 0)] // Office Staff: 1st day free
    [InlineData(10000, 2, 1, 30, 333.33333333333333333333333333)] // Arsalan Ahmed: (2-1)*10000/30
    [InlineData(10000, 3, 1, 30, 666.66666666666666666666666667)] // Shoaib Ahmed: (3-1)*10000/30
    [InlineData(40000, 4, 1, 30, 4000)] // Khalid Driver (Office/Senior policy): (4-1)*40000/30 = 4000
    [InlineData(40000, 7, 1, 30, 8000)] // Mobeen Ahmed: (7-1)*40000/30 = 8000
    [InlineData(15000, 8, 1, 30, 3500)] // Moiz Ahmed: (8-1)*15000/30 = 3500
    public void FirstDayFreeStrategy_CalculatesAccurately(
        decimal basicSalary,
        decimal absentDays,
        int graceDays,
        int monthlyDivisor,
        decimal expectedDeduction)
    {
        var strategy = new FirstDayFreeDeductionStrategy();
        var result = strategy.CalculateDeduction(basicSalary, absentDays, graceDays, monthlyDivisor);

        Assert.Equal(Math.Round(expectedDeduction, 2), Math.Round(result, 2));
    }

    [Theory]
    [InlineData(17500, 0, 1, 30, 0)]
    [InlineData(17500, 1, 1, 30, 0)] // 1 day grace: 0 deduction (Asif Ahmed, Imran Baloch, Hasnain Ali)
    [InlineData(17500, 2, 1, 30, 1166.6666666666666666666666667)] // Abdul Rasheed (all 2 days deducted: 17500*2/30)
    [InlineData(30000, 2, 1, 30, 2000)] // Deedar Shaikh: 30000*2/30 = 2000
    [InlineData(22000, 9, 1, 30, 6600)] // Haji Baloch: 22000*9/30 = 6600
    [InlineData(40000, 8, 1, 30, 10666.666666666666666666666667)] // Mashooq Ali: 40000*8/30 = 10666.67
    [InlineData(33000, 6, 1, 30, 6600)] // Mehrab: 33000*6/30 = 6600
    [InlineData(24000, 10, 1, 30, 8000)] // Yaseen Baloch: 24000*10/30 = 8000
    public void ThresholdGraceStrategy_CalculatesAccurately(
        decimal basicSalary,
        decimal absentDays,
        int graceDays,
        int monthlyDivisor,
        decimal expectedDeduction)
    {
        var strategy = new ThresholdGraceDeductionStrategy();
        var result = strategy.CalculateDeduction(basicSalary, absentDays, graceDays, monthlyDivisor);

        Assert.Equal(Math.Round(expectedDeduction, 2), Math.Round(result, 2));
    }

    [Theory]
    [InlineData(30000, 1, 1, 30, 1000)] // Deducts day 1 directly
    [InlineData(30000, 2, 1, 30, 2000)]
    public void StandardFullStrategy_DeductsAllDays(
        decimal basicSalary,
        decimal absentDays,
        int graceDays,
        int monthlyDivisor,
        decimal expectedDeduction)
    {
        var strategy = new StandardFullDeductionStrategy();
        var result = strategy.CalculateDeduction(basicSalary, absentDays, graceDays, monthlyDivisor);

        Assert.Equal(expectedDeduction, result);
    }

    [Fact]
    public void StrategyFactory_ResolvesCorrectStrategy()
    {
        var strategies = new IAbsenceDeductionStrategy[]
        {
            new FirstDayFreeDeductionStrategy(),
            new ThresholdGraceDeductionStrategy(),
            new StandardFullDeductionStrategy()
        };

        var factory = new AbsenceStrategyFactory(strategies);

        var s1 = factory.GetStrategy(AbsencePolicy.FirstDayFree_DeductRemaining);
        Assert.IsType<FirstDayFreeDeductionStrategy>(s1);

        var s2 = factory.GetStrategy(AbsencePolicy.ThresholdGrace_DeductAllIfExceeded);
        Assert.IsType<ThresholdGraceDeductionStrategy>(s2);

        var s3 = factory.GetStrategy(AbsencePolicy.StandardFullDeduction);
        Assert.IsType<StandardFullDeductionStrategy>(s3);
    }
}
