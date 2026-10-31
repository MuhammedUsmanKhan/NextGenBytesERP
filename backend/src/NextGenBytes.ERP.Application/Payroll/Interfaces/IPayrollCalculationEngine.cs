using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Application.Payroll.Interfaces;

public interface IPayrollCalculationEngine
{
    Payslip CalculatePayslip(
        Employee employee,
        EmployeeContract contract,
        AttendanceSummary? attendance,
        List<LoanAndAdvance> activeLoans);

    PayslipDenomination CalculateDenominations(decimal netSalary);
}

