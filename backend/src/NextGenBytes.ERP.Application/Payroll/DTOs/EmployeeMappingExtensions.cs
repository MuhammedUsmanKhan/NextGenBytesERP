using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Application.Payroll.DTOs;

public static class EmployeeMappingExtensions
{
    public static EmployeeResponse ToResponse(this Employee employee)
    {
        var activeContract = employee.Contracts?
            .FirstOrDefault(c => c.IsActive)?
            .ToResponse();

        return new EmployeeResponse
        {
            Id = employee.Id,
            Code = employee.Code,
            FullName = employee.FullName,
            CNIC = employee.CNIC,
            Phone = employee.Phone,
            DepartmentId = employee.DepartmentId,
            DepartmentName = employee.Department?.Name,
            Designation = employee.Designation,
            BiometricDeviceId = employee.BiometricDeviceId,
            ShiftDefinitionId = employee.ShiftDefinitionId,
            ShiftName = employee.ShiftDefinition?.Name,
            Category = employee.Category,
            DateOfJoining = employee.DateOfJoining,
            Status = employee.Status,
            ActiveContract = activeContract,
            CreatedAt = employee.CreatedAt
        };
    }

    public static EmployeeContractResponse ToResponse(this EmployeeContract contract)
    {
        return new EmployeeContractResponse
        {
            Id = contract.Id,
            EmployeeId = contract.EmployeeId,
            PayType = contract.PayType,
            DisbursementType = contract.DisbursementType,
            BasicRate = contract.BasicRate,
            AttendanceAllowance = contract.AttendanceAllowance,
            OtherAllowances = contract.OtherAllowances,
            MonthlyDivisorDays = contract.MonthlyDivisorDays,
            DailyShiftHours = contract.DailyShiftHours,
            NightShiftMinutes = contract.NightShiftMinutes,
            AbsencePolicy = contract.AbsencePolicy,
            GraceAbsentDays = contract.GraceAbsentDays,
            OvertimeEligible = contract.OvertimeEligible,
            OvertimeMultiplier = contract.OvertimeMultiplier,
            RoundingMode = contract.RoundingMode,
            BankName = contract.BankName,
            BankAccountNumber = contract.BankAccountNumber,
            EffectiveFrom = contract.EffectiveFrom,
            EffectiveTo = contract.EffectiveTo,
            IsActive = contract.IsActive,
            CreatedAt = contract.CreatedAt
        };
    }
}

