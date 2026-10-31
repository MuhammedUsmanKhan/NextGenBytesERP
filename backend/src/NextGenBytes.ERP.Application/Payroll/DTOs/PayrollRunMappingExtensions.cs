using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Application.Payroll.DTOs;

public static class PayrollRunMappingExtensions
{
    public static PayrollRunResponse ToResponse(this PayrollRun run)
    {
        return new PayrollRunResponse
        {
            Id = run.Id,
            MonthYear = run.MonthYear,
            DepartmentCategory = run.DepartmentCategory,
            RunDate = run.RunDate,
            Status = run.Status,
            EmployeeCount = run.Payslips?.Count ?? 0,
            TotalGrossSalary = run.TotalGrossSalary,
            TotalDeductions = run.TotalDeductions,
            TotalDueGross = run.TotalDueGross,
            TotalDueGrossRounded = run.TotalDueGrossRounded,
            TotalLoansAndAdvances = run.TotalLoansAndAdvances,
            TotalNetSalary = run.TotalNetSalary,
            Notes = run.Notes,
            ApprovedBy = run.ApprovedBy,
            ApprovedAt = run.ApprovedAt,
            CreatedAt = run.CreatedAt
        };
    }

    public static PayslipResponse ToResponse(this Payslip payslip)
    {
        PayslipDenominationResponse? denom = null;
        if (payslip.Denomination != null)
        {
            denom = new PayslipDenominationResponse
            {
                Note5000 = payslip.Denomination.Note5000,
                Note1000 = payslip.Denomination.Note1000,
                Note500 = payslip.Denomination.Note500,
                Note100 = payslip.Denomination.Note100,
                Note50 = payslip.Denomination.Note50,
                Note20 = payslip.Denomination.Note20,
                Note10 = payslip.Denomination.Note10,
                CoinsRemainder = payslip.Denomination.CoinsRemainder
            };
        }

        return new PayslipResponse
        {
            Id = payslip.Id,
            PayrollRunId = payslip.PayrollRunId,
            EmployeeId = payslip.EmployeeId,
            EmployeeCode = payslip.Employee?.Code ?? string.Empty,
            EmployeeName = payslip.EmployeeNameSnapshot,
            DepartmentName = payslip.DepartmentSnapshot,
            Category = payslip.Employee?.Category ?? string.Empty,
            PayType = payslip.PayTypeSnapshot,
            DisbursementType = payslip.DisbursementType,
            BasicRate = payslip.BasicRate,
            AttendanceAllowance = payslip.AttendanceAllowance,
            OtherAllowances = payslip.OtherAllowances,
            GrossSalary = payslip.GrossSalary,
            DaysPresent = payslip.DaysPresent,
            AbsentDays = payslip.AbsentDays,
            AbsentDeduction = payslip.AbsentDeduction,
            LateMinutes = payslip.LateMinutes,
            LateDeduction = payslip.LateDeduction,
            NightShiftsCount = payslip.NightShiftsCount,
            NightShiftMinutes = payslip.NightShiftMinutes,
            NightShiftAmount = payslip.NightShiftAmount,
            OvertimeMinutes = payslip.OvertimeMinutes,
            OvertimeAmount = payslip.OvertimeAmount,
            TotalDeductions = payslip.TotalDeductions,
            DueGrossSalary = payslip.DueGrossSalary,
            DueGrossSalaryRounded = payslip.DueGrossSalaryRounded,
            LoanDeduction = payslip.LoanDeduction,
            AdvanceSalaryDeduction = payslip.AdvanceSalaryDeduction,
            TotalLess = payslip.TotalLess,
            NetSalary = payslip.NetSalary,
            Denomination = denom
        };
    }
}

