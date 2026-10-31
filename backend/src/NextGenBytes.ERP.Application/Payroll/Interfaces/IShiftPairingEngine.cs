using NextGenBytes.ERP.Domain.Payroll;

namespace NextGenBytes.ERP.Application.Payroll.Interfaces;

public interface IShiftPairingEngine
{
    List<DailyAttendance> PairAndComputeDailyAttendance(
        List<RawPunchLog> punches,
        List<Employee> employees,
        List<ShiftDefinition> shifts,
        List<CompanyCalendarHoliday> holidays,
        string importBatchId,
        string userId,
        List<ShiftRosterAssignment>? rosterAssignments = null);
}

