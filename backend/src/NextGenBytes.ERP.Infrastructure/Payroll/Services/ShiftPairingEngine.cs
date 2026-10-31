using NextGenBytes.ERP.Application.Payroll.Interfaces;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Domain.Payroll.Enums;

namespace NextGenBytes.ERP.Infrastructure.Payroll.Services;

public sealed class ShiftPairingEngine : IShiftPairingEngine
{
    private static readonly ShiftDefinition DefaultShift = new()
    {
        Name = "Default Shift (10h)",
        ShiftStart = new TimeOnly(8, 0),
        ShiftEnd = new TimeOnly(18, 0),
        ShiftDurationMinutes = 600,
        GraceLateMinutes = 10,
        GraceMode = GraceDeductionMode.DeductAllFromStart,
        IsOvernightShift = false,
        NightShiftStart = new TimeOnly(18, 0),
        NightShiftEnd = new TimeOnly(6, 0)
    };

    public List<DailyAttendance> PairAndComputeDailyAttendance(
        List<RawPunchLog> punches,
        List<Employee> employees,
        List<ShiftDefinition> shifts,
        List<CompanyCalendarHoliday> holidays,
        string importBatchId,
        string userId,
        List<ShiftRosterAssignment>? rosterAssignments = null)
    {
        var result = new List<DailyAttendance>();
        var empDict = employees.ToDictionary(e => e.Id);

        // Index roster assignments by (EmployeeId, Date)
        var rosterLookup = (rosterAssignments ?? [])
            .GroupBy(r => (r.EmployeeId, r.Date))
            .ToDictionary(g => g.Key, g => g.First());

        // Group punches by EmployeeId (skip unmapped)
        var punchesByEmp = punches
            .Where(p => p.EmployeeId.HasValue)
            .GroupBy(p => p.EmployeeId!.Value);

        foreach (var empGroup in punchesByEmp)
        {
            var empId = empGroup.Key;
            if (!empDict.TryGetValue(empId, out var emp))
                continue;

            // Resolve permanent default shift: Employee override -> Department shift -> DefaultShift
            var defaultEmpShift = emp.ShiftDefinition
                ?? (emp.DepartmentId.HasValue ? shifts.FirstOrDefault(s => s.DepartmentId == emp.DepartmentId.Value && s.IsActive) : null)
                ?? shifts.FirstOrDefault(s => s.IsActive)
                ?? DefaultShift;

            // Sort punches chronologically
            var sortedPunches = empGroup.OrderBy(p => p.PunchTimestamp).ToList();

            // Stage 1: Mark rapid duplicate scans within 60 seconds
            for (var i = 1; i < sortedPunches.Count; i++)
            {
                var diffSeconds = (sortedPunches[i].PunchTimestamp - sortedPunches[i - 1].PunchTimestamp).TotalSeconds;
                if (diffSeconds < 60)
                {
                    sortedPunches[i].IsDuplicateFiltered = true;
                }
            }

            var validPunches = sortedPunches.Where(p => !p.IsDuplicateFiltered).ToList();
            if (validPunches.Count == 0)
                continue;

            // Stage 2: Bind punches to Shift Dates
            // Look ahead: does punch belong to an overnight shift (scheduled on Date D or unscheduled evening)?
            var punchesByShiftDate = new Dictionary<DateOnly, List<RawPunchLog>>();

            foreach (var punch in validPunches)
            {
                var ts = punch.PunchTimestamp;
                DateOnly shiftDate;

                // Morning punch before 12:00
                if (ts.TimeOfDay < new TimeSpan(12, 0, 0))
                {
                    var prevDate = DateOnly.FromDateTime(ts.AddDays(-1));
                    var isPrevScheduledNight = rosterLookup.TryGetValue((empId, prevDate), out var prevRoster) && prevRoster.IsOvernightShift;
                    var isPrevOvernightShift = defaultEmpShift.IsOvernightShift;

                    // If previous evening had a punch after 16:00, this morning punch completes it
                    var hadEveningPunchYesterday = validPunches.Any(p =>
                        DateOnly.FromDateTime(p.PunchTimestamp) == prevDate &&
                        p.PunchTimestamp.TimeOfDay >= new TimeSpan(16, 0, 0));

                    if (isPrevScheduledNight || isPrevOvernightShift || hadEveningPunchYesterday)
                    {
                        shiftDate = prevDate;
                    }
                    else
                    {
                        shiftDate = DateOnly.FromDateTime(ts);
                    }
                }
                else
                {
                    // Evening / afternoon punch belongs to today's shift date
                    shiftDate = DateOnly.FromDateTime(ts);
                }

                if (!punchesByShiftDate.TryGetValue(shiftDate, out var list))
                {
                    list = [];
                    punchesByShiftDate[shiftDate] = list;
                }
                list.Add(punch);
            }

            // Track overnight shifts completed for post-night rest protection
            var nightShiftDates = new List<(DateOnly ShiftDate, bool ExcuseNextDay)>();

            // Stage 3: Process each shift date
            foreach (var (shiftDate, dayPunches) in punchesByShiftDate)
            {
                var daily = new DailyAttendance
                {
                    Id = Guid.NewGuid(),
                    EmployeeId = empId,
                    Date = shiftDate,
                    TotalPunches = dayPunches.Count,
                    ImportBatchId = importBatchId,
                    Source = "DAT_IMPORT",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };

                var firstPunch = dayPunches.First().PunchTimestamp;
                var lastPunch = dayPunches.Last().PunchTimestamp;

                var firstTime = TimeOnly.FromDateTime(firstPunch);
                var lastTime = TimeOnly.FromDateTime(lastPunch);

                daily.FirstPunchIn = firstTime;
                daily.LastPunchOut = lastTime;

                // Calendar Rest / Holiday Checks
                var dayOfWeek = shiftDate.DayOfWeek;
                var isRestDay = dayOfWeek == DayOfWeek.Sunday;
                var matchingHoliday = holidays.FirstOrDefault(h => h.Date == shiftDate);

                if (matchingHoliday != null)
                {
                    daily.IsHoliday = true;
                }
                else if (isRestDay)
                {
                    daily.IsWeekend = true;
                }

                // Check Roster Assignment for this shift date
                var hasRosterAssignment = rosterLookup.TryGetValue((empId, shiftDate), out var scheduledShift);

                // Check for single punch day (Missing Checkout)
                if (dayPunches.Count == 1)
                {
                    daily.HasException = true;
                    daily.IsSinglePunchMissing = true;
                    daily.ExceptionType = "SINGLE_PUNCH_MISSING";
                    daily.WorkedMinutes = 0;
                    daily.OvertimeMinutes = 0;
                    daily.IsAbsent = false;
                    daily.IsBaseWageApproved = false;

                    if (hasRosterAssignment && scheduledShift != null)
                    {
                        daily.ShiftPayMultiplier = scheduledShift.PayMultiplier;
                        daily.IsNightShift = scheduledShift.IsOvernightShift;
                        daily.LateMinutes = ComputeLateMinutes(firstTime, scheduledShift.ShiftStart, 15, GraceDeductionMode.DeductAllFromStart);

                        if (scheduledShift.IsOvernightShift)
                        {
                            nightShiftDates.Add((shiftDate, scheduledShift.ExcuseOverlappingDayShift));
                        }
                    }
                    else
                    {
                        daily.LateMinutes = ComputeLateMinutes(firstTime, defaultEmpShift.ShiftStart, defaultEmpShift.GraceLateMinutes, defaultEmpShift.GraceMode);
                        daily.IsNightShift = CheckNightWindow(firstTime, defaultEmpShift);
                    }

                    result.Add(daily);
                    continue;
                }

                // Paired session calculation (2 or more punches)
                var totalDurationMinutes = (int)(lastPunch - firstPunch).TotalMinutes;
                daily.WorkedMinutes = Math.Max(0, totalDurationMinutes);
                daily.IsBaseWageApproved = true;

                if (hasRosterAssignment && scheduledShift != null)
                {
                    // --- Case A: SCHEDULED TEMPORARY SHIFT ---
                    daily.ShiftPayMultiplier = scheduledShift.PayMultiplier;
                    daily.IsNightShift = scheduledShift.IsOvernightShift;
                    daily.IsOvertimeApproved = true;

                    if (scheduledShift.IsOvernightShift)
                    {
                        nightShiftDates.Add((shiftDate, scheduledShift.ExcuseOverlappingDayShift));
                    }

                    daily.LateMinutes = ComputeLateMinutes(firstTime, scheduledShift.ShiftStart, 15, GraceDeductionMode.DeductAllFromStart);

                    // Check if punches exceed scheduled shift duration
                    if (daily.WorkedMinutes > scheduledShift.ShiftDurationMinutes)
                    {
                        var extraMins = daily.WorkedMinutes - scheduledShift.ShiftDurationMinutes;
                        if (extraMins > 15) // Greater than 15 mins past scheduled end
                        {
                            daily.OvertimeMinutes = extraMins;
                            daily.HasException = true;
                            daily.ExceptionType = "EXTRA_HOURS_OVERTIME";
                            daily.ResolutionNotes = $"Punched out {extraMins} mins after scheduled shift end ({scheduledShift.ShiftEnd:HH:mm}). Overtime pending supervisor sign-off.";
                            daily.IsOvertimeApproved = false;
                            daily.PendingOvertimeMinutes = extraMins;
                        }
                    }
                }
                else
                {
                    // --- Case B: BASELINE DAY SHIFT OR UNSCHEDULED NIGHT SHIFT ---
                    var isNightPunch = CheckNightWindow(firstTime, defaultEmpShift) || (lastPunch.Date > firstPunch.Date);

                    if (isNightPunch)
                    {
                        // Unscheduled Night Punch! Flag for supervisor approval
                        daily.IsNightShift = true;
                        daily.HasException = true;
                        daily.ExceptionType = "UNSCHEDULED_NIGHT_SHIFT";
                        daily.ResolutionNotes = "Overnight shift worked without prior duty roster assignment. Pending supervisor approval.";
                        daily.ShiftPayMultiplier = null; // Hold multiplier until supervisor approves
                        daily.PendingPayMultiplier = 1.5m;
                        daily.PendingOvertimeMinutes = daily.WorkedMinutes;
                        daily.IsOvertimeApproved = false;
                        nightShiftDates.Add((shiftDate, true));
                    }
                    else
                    {
                        // Standard daytime shift
                        daily.IsNightShift = false;
                        daily.LateMinutes = ComputeLateMinutes(firstTime, defaultEmpShift.ShiftStart, defaultEmpShift.GraceLateMinutes, defaultEmpShift.GraceMode);

                        if (lastTime < defaultEmpShift.ShiftEnd)
                        {
                            daily.EarlyLeaveMinutes = (int)(defaultEmpShift.ShiftEnd - lastTime).TotalMinutes;
                        }

                        if (daily.IsHoliday || daily.IsWeekend)
                        {
                            daily.OvertimeMinutes = daily.WorkedMinutes;
                        }
                        else if (daily.WorkedMinutes > defaultEmpShift.ShiftDurationMinutes)
                        {
                            daily.OvertimeMinutes = daily.WorkedMinutes - defaultEmpShift.ShiftDurationMinutes;
                        }
                    }
                }

                result.Add(daily);
            }

            // Stage 4: Post-Night Rest Protection (Q2)
            // For any night shift ending on morning of Day D+1, if no day punches exist on D+1,
            // excuse the day shift so the employee is not falsely penalized with an absence deduction!
            foreach (var (nightDate, excuseNextDay) in nightShiftDates)
            {
                if (!excuseNextDay) continue;

                var nextDay = nightDate.AddDays(1);
                var alreadyHasRecord = result.Any(r => r.EmployeeId == empId && r.Date == nextDay);

                if (!alreadyHasRecord)
                {
                    result.Add(new DailyAttendance
                    {
                        Id = Guid.NewGuid(),
                        EmployeeId = empId,
                        Date = nextDay,
                        TotalPunches = 0,
                        WorkedMinutes = 0,
                        IsAbsent = false,
                        IsExcusedPostNightRest = true,
                        IsWeekend = nextDay.DayOfWeek == DayOfWeek.Sunday,
                        IsBaseWageApproved = true,
                        Source = "POST_NIGHT_REST",
                        ImportBatchId = importBatchId,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = userId
                    });
                }
            }
        }

        return result;
    }

    private static int ComputeLateMinutes(TimeOnly punchIn, TimeOnly shiftStart, int graceMinutes, GraceDeductionMode graceMode)
    {
        if (punchIn <= shiftStart)
            return 0;

        var diff = (int)(punchIn - shiftStart).TotalMinutes;
        if (diff <= graceMinutes)
            return 0;

        return graceMode == GraceDeductionMode.DeductAllFromStart
            ? diff
            : diff - graceMinutes;
    }

    private static bool CheckNightWindow(TimeOnly punchIn, ShiftDefinition shift)
    {
        if (shift.IsOvernightShift)
            return true;

        return punchIn >= shift.NightShiftStart || punchIn <= shift.NightShiftEnd;
    }
}
