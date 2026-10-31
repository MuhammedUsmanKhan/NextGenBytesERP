using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;

namespace NextGenBytes.ERP.Application.Payroll.Interfaces;

public interface IEmployeeService
{
    Task<ApiResponse<PagedResponse<EmployeeResponse>>> GetAllAsync(
        int page,
        int pageSize,
        string? search = null,
        string? category = null,
        Guid? departmentId = null,
        string? status = null);

    Task<ApiResponse<EmployeeResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<EmployeeResponse>> CreateAsync(CreateEmployeeRequest request, string createdBy);
    Task<ApiResponse<EmployeeResponse>> UpdateAsync(Guid id, UpdateEmployeeRequest request, string updatedBy);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);

    Task<ApiResponse<EmployeeContractResponse>> AddContractAsync(Guid employeeId, CreateContractRequest request, string createdBy);
    Task<ApiResponse<List<EmployeeContractResponse>>> GetContractsAsync(Guid employeeId);
}

