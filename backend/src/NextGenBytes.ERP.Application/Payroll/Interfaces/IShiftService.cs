using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;

namespace NextGenBytes.ERP.Application.Payroll.Interfaces;

public interface IShiftService
{
    Task<ApiResponse<List<ShiftDefinitionDto>>> GetAllShiftsAsync();
    Task<ApiResponse<ShiftDefinitionDto>> GetShiftByIdAsync(Guid id);
    Task<ApiResponse<ShiftDefinitionDto>> CreateShiftAsync(CreateShiftDefinitionRequest request, string userId);
    Task<ApiResponse<ShiftDefinitionDto>> UpdateShiftAsync(Guid id, UpdateShiftDefinitionRequest request, string userId);
    Task<ApiResponse<bool>> DeleteShiftAsync(Guid id, string userId);
}

