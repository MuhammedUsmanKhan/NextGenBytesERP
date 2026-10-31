using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Interfaces;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Payroll.Services;

public sealed class ShiftService : IShiftService
{
    private readonly AppDbContext _context;

    public ShiftService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<ShiftDefinitionDto>>> GetAllShiftsAsync()
    {
        var shifts = await _context.ShiftDefinitions
            .Include(s => s.Department)
            .Include(s => s.Employees)
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .Select(s => new ShiftDefinitionDto
            {
                Id = s.Id,
                Name = s.Name,
                DepartmentId = s.DepartmentId,
                DepartmentName = s.Department != null ? s.Department.Name : null,
                ShiftStart = s.ShiftStart,
                ShiftEnd = s.ShiftEnd,
                ShiftDurationMinutes = s.ShiftDurationMinutes,
                GraceLateMinutes = s.GraceLateMinutes,
                GraceMode = s.GraceMode,
                IsOvernightShift = s.IsOvernightShift,
                NightShiftStart = s.NightShiftStart,
                NightShiftEnd = s.NightShiftEnd,
                IsActive = s.IsActive,
                AssignedEmployeeCount = s.Employees.Count
            })
            .ToListAsync();

        return ApiResponse<List<ShiftDefinitionDto>>.Ok(shifts);
    }

    public async Task<ApiResponse<ShiftDefinitionDto>> GetShiftByIdAsync(Guid id)
    {
        var s = await _context.ShiftDefinitions
            .Include(s => s.Department)
            .Include(s => s.Employees)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id);

        if (s == null)
            return ApiResponse<ShiftDefinitionDto>.Fail("Shift definition not found.");

        return ApiResponse<ShiftDefinitionDto>.Ok(new ShiftDefinitionDto
        {
            Id = s.Id,
            Name = s.Name,
            DepartmentId = s.DepartmentId,
            DepartmentName = s.Department?.Name,
            ShiftStart = s.ShiftStart,
            ShiftEnd = s.ShiftEnd,
            ShiftDurationMinutes = s.ShiftDurationMinutes,
            GraceLateMinutes = s.GraceLateMinutes,
            GraceMode = s.GraceMode,
            IsOvernightShift = s.IsOvernightShift,
            NightShiftStart = s.NightShiftStart,
            NightShiftEnd = s.NightShiftEnd,
            IsActive = s.IsActive,
            AssignedEmployeeCount = s.Employees.Count
        });
    }

    public async Task<ApiResponse<ShiftDefinitionDto>> CreateShiftAsync(CreateShiftDefinitionRequest request, string userId)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<ShiftDefinitionDto>.Fail("Shift name is required.");

        var shift = new ShiftDefinition
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            DepartmentId = request.DepartmentId,
            ShiftStart = request.ShiftStart,
            ShiftEnd = request.ShiftEnd,
            ShiftDurationMinutes = request.ShiftDurationMinutes > 0 ? request.ShiftDurationMinutes : 540,
            GraceLateMinutes = request.GraceLateMinutes >= 0 ? request.GraceLateMinutes : 10,
            GraceMode = request.GraceMode,
            IsOvernightShift = request.IsOvernightShift,
            NightShiftStart = request.NightShiftStart,
            NightShiftEnd = request.NightShiftEnd,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.ShiftDefinitions.Add(shift);
        await _context.SaveChangesAsync();

        return await GetShiftByIdAsync(shift.Id);
    }

    public async Task<ApiResponse<ShiftDefinitionDto>> UpdateShiftAsync(Guid id, UpdateShiftDefinitionRequest request, string userId)
    {
        var shift = await _context.ShiftDefinitions.FindAsync(id);
        if (shift == null)
            return ApiResponse<ShiftDefinitionDto>.Fail("Shift definition not found.");

        shift.Name = request.Name.Trim();
        shift.DepartmentId = request.DepartmentId;
        shift.ShiftStart = request.ShiftStart;
        shift.ShiftEnd = request.ShiftEnd;
        shift.ShiftDurationMinutes = request.ShiftDurationMinutes > 0 ? request.ShiftDurationMinutes : 540;
        shift.GraceLateMinutes = request.GraceLateMinutes >= 0 ? request.GraceLateMinutes : 10;
        shift.GraceMode = request.GraceMode;
        shift.IsOvernightShift = request.IsOvernightShift;
        shift.NightShiftStart = request.NightShiftStart;
        shift.NightShiftEnd = request.NightShiftEnd;
        shift.IsActive = request.IsActive;
        shift.UpdatedAt = DateTime.UtcNow;
        shift.UpdatedBy = userId;

        await _context.SaveChangesAsync();
        return await GetShiftByIdAsync(shift.Id);
    }

    public async Task<ApiResponse<bool>> DeleteShiftAsync(Guid id, string userId)
    {
        var shift = await _context.ShiftDefinitions
            .Include(s => s.Employees)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (shift == null)
            return ApiResponse<bool>.Fail("Shift definition not found.");

        if (shift.Employees.Count > 0)
            return ApiResponse<bool>.Fail("Cannot delete a shift that is currently assigned to employees. Reassign them first.");

        _context.ShiftDefinitions.Remove(shift);
        await _context.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true);
    }
}
