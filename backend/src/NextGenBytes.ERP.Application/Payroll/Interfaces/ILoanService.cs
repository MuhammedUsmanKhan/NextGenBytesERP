using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Application.Payroll.Interfaces;

public interface ILoanService
{
    Task<ApiResponse<PagedResponse<LoanAndAdvanceResponse>>> GetAllAsync(
        Guid? employeeId = null,
        LoanType? type = null,
        LoanStatus? status = null,
        int page = 1,
        int pageSize = 20);

    Task<ApiResponse<LoanAndAdvanceResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<LoanAndAdvanceResponse>> CreateAsync(CreateLoanRequest request, string userId);
    Task<ApiResponse<LoanAndAdvanceResponse>> UpdateAsync(Guid id, UpdateLoanRequest request, string userId);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string userId);
    Task<ApiResponse<List<LoanAndAdvanceResponse>>> GetActiveLoansForEmployeeAsync(Guid employeeId);
}

