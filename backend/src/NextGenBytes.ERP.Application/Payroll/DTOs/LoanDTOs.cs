using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.DTOs;

public sealed class LoanAndAdvanceResponse
{
    public Guid Id { get; init; }
    public Guid EmployeeId { get; init; }
    public string EmployeeCode { get; init; } = string.Empty;
    public string EmployeeName { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string? DepartmentName { get; init; }

    public LoanType Type { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal MonthlyDeduction { get; init; }
    public decimal RemainingBalance { get; init; }
    public decimal RepaidAmount => TotalAmount - RemainingBalance;
    public DateTime DisbursedDate { get; init; }
    public LoanStatus Status { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
}

public sealed class CreateLoanRequest
{
    public Guid EmployeeId { get; init; }
    public LoanType Type { get; init; } = LoanType.SalaryAdvance;
    public decimal TotalAmount { get; init; }
    public decimal MonthlyDeduction { get; init; }
    public DateTime? DisbursedDate { get; init; }
    public string? Notes { get; init; }
}

public sealed class UpdateLoanRequest
{
    public decimal MonthlyDeduction { get; init; }
    public decimal? RemainingBalance { get; init; }
    public LoanStatus Status { get; init; }
    public string? Notes { get; init; }
}

public static class LoanMappingExtensions
{
    public static LoanAndAdvanceResponse ToResponse(this LoanAndAdvance loan)
    {
        return new LoanAndAdvanceResponse
        {
            Id = loan.Id,
            EmployeeId = loan.EmployeeId,
            EmployeeCode = loan.Employee?.Code ?? string.Empty,
            EmployeeName = loan.Employee?.FullName ?? string.Empty,
            Category = loan.Employee?.Category ?? string.Empty,
            DepartmentName = loan.Employee?.Department?.Name,
            Type = loan.Type,
            TotalAmount = loan.TotalAmount,
            MonthlyDeduction = loan.MonthlyDeduction,
            RemainingBalance = loan.RemainingBalance,
            DisbursedDate = loan.DisbursedDate,
            Status = loan.Status,
            Notes = loan.Notes,
            CreatedAt = loan.CreatedAt
        };
    }
}

