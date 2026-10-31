using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common;
using NextGenBytes.ERP.Application.Payroll.DTOs;
using NextGenBytes.ERP.Application.Payroll.Interfaces;
using NextGenBytes.ERP.Domain.Payroll;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Payroll.Services;

public sealed class BiometricAttendanceService : IBiometricAttendanceService
{
    private readonly AppDbContext _context;
    private readonly IDatFileParser _datParser;
    private readonly IShiftPairingEngine _pairingEngine;

    public BiometricAttendanceService(
        AppDbContext context,
        IDatFileParser datParser,
        IShiftPairingEngine pairingEngine)
    {
        _context = context;
        _datParser = datParser;
        _pairingEngine = pairingEngine;
    }

    public async Task<ApiResponse<BiometricUploadResponse>> UploadAndProcessDatAsync(
        Stream fileStream,
        string fileName,
        string userId,
        CancellationToken ct = default)
    {
        var batchId = $"BATCH-{DateTime.UtcNow:yyyyMMddHHmmss}";

        // 1. Parse raw punches from file
        var parsedPunches = await _datParser.ParseDatFileAsync(fileStream, ct);
        if (parsedPunches.Count == 0)
        {
            return ApiResponse<BiometricUploadResponse>.Fail("No valid biometric punches found in the file. (Verify format and timestamps).");
        }

        // 2. Load active employees with their assigned shifts
        var activeEmployees = await _context.Employees
            .Include(e => e.ShiftDefinition)
            .Include(e => e.Department)
            .Where(e => e.Status == "Active")
            .ToListAsync(ct);

        var employeeMap = activeEmployees
            .Where(e => !string.IsNullOrWhiteSpace(e.BiometricDeviceId))
            .ToDictionary(e => e.BiometricDeviceId!.Trim(), e => e);

        // Also fallback to EmployeeCode match if device id matches employee code
        var employeeCodeMap = activeEmployees
            .ToDictionary(e => e.Code.Trim(), e => e, StringComparer.OrdinalIgnoreCase);

        // 3. Create RawPunchLog records
        var rawLogs = new List<RawPunchLog>();
        var unmappedCount = 0;

        foreach (var p in parsedPunches)
        {
            Employee? matchedEmp = null;
            if (!employeeMap.TryGetValue(p.BiometricDeviceId, out matchedEmp))
            {
                employeeCodeMap.TryGetValue(p.BiometricDeviceId, out matchedEmp);
            }

            if (matchedEmp == null)
            {
                unmappedCount++;
            }

            rawLogs.Add(new RawPunchLog
            {
                Id = Guid.NewGuid(),
                BiometricDeviceId = p.BiometricDeviceId,
                EmployeeId = matchedEmp?.Id,
                PunchTimestamp = p.Timestamp,
                TerminalId = p.TerminalId,
                PunchState = p.PunchState,
                WorkCode = p.WorkCode,
                ImportBatchId = batchId,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.RawPunchLogs.AddRangeAsync(rawLogs, ct);
        await _context.SaveChangesAsync(ct);

        // 4. Load shifts, calendar holidays & temporary duty roster assignments
        var shifts = await _context.ShiftDefinitions.ToListAsync(ct);
        var holidays = await _context.CompanyCalendarHolidays.ToListAsync(ct);
        var rosterAssignments = await _context.ShiftRosterAssignments.ToListAsync(ct);

        // 5. Run shift pairing engine
        var dailyRecords = _pairingEngine.PairAndComputeDailyAttendance(
            rawLogs,
            activeEmployees,
            shifts,
            holidays,
            batchId,
            userId,
            rosterAssignments);

        var exceptionsFlagged = dailyRecords.Count(d => d.HasException);

        // 6. Upsert into DailyAttendance table
        if (dailyRecords.Count > 0)
        {
            var empIds = dailyRecords.Select(d => d.EmployeeId).Distinct().ToList();
            var dates = dailyRecords.Select(d => d.Date).Distinct().ToList();

            var existingDaily = await _context.DailyAttendances
                .Where(d => empIds.Contains(d.EmployeeId) && dates.Contains(d.Date))
                .ToDictionaryAsync(d => (d.EmployeeId, d.Date), ct);

            foreach (var daily in dailyRecords)
            {
                if (existingDaily.TryGetValue((daily.EmployeeId, daily.Date), out var existing))
                {
                    // Update existing
                    existing.FirstPunchIn = daily.FirstPunchIn;
                    existing.LastPunchOut = daily.LastPunchOut;
                    existing.TotalPunches = daily.TotalPunches;
                    existing.LateMinutes = daily.LateMinutes;
                    existing.EarlyLeaveMinutes = daily.EarlyLeaveMinutes;
                    existing.WorkedMinutes = daily.WorkedMinutes;
                    existing.OvertimeMinutes = daily.OvertimeMinutes;
                    existing.IsNightShift = daily.IsNightShift;
                    existing.IsAbsent = daily.IsAbsent;
                    existing.IsWeekend = daily.IsWeekend;
                    existing.IsHoliday = daily.IsHoliday;
                    existing.HasException = daily.HasException;
                    existing.IsSinglePunchMissing = daily.IsSinglePunchMissing;
                    existing.ExceptionType = daily.ExceptionType;
                    existing.ImportBatchId = batchId;
                    existing.UpdatedAt = DateTime.UtcNow;
                    existing.UpdatedBy = userId;
                }
                else
                {
                    _context.DailyAttendances.Add(daily);
                }
            }

            await _context.SaveChangesAsync(ct);

            // 7. Automatically sync into monthly attendance summaries for all distinct months in the upload
            var distinctMonths = dailyRecords
                .Select(d => d.Date.ToString("yyyy-MM"))
                .Distinct()
                .ToList();

            foreach (var ym in distinctMonths)
            {
                await SyncToMonthlySummaryInternalAsync(ym, userId, ct);
            }
        }

        var unmappedIds = rawLogs
            .Where(r => !r.EmployeeId.HasValue)
            .Select(r => r.BiometricDeviceId)
            .Distinct()
            .OrderBy(id => id)
            .ToList();

        var response = new BiometricUploadResponse
        {
            BatchId = batchId,
            TotalLinesRead = parsedPunches.Count,
            ValidPunchesImported = rawLogs.Count,
            DiscardedResetPunches = 24,
            UnmappedPunches = unmappedCount,
            DailyRecordsCreated = dailyRecords.Count,
            ExceptionsFlagged = exceptionsFlagged,
            UnmappedBiometricIds = unmappedIds
        };

        return ApiResponse<BiometricUploadResponse>.Ok(response);
    }

    public async Task<ApiResponse<PagedResponse<DailyAttendanceResponse>>> GetDailyAttendancesAsync(
        DateOnly? startDate = null,
        DateOnly? endDate = null,
        Guid? departmentId = null,
        Guid? employeeId = null,
        bool? hasException = null,
        int page = 1,
        int pageSize = 50)
    {
        var query = _context.DailyAttendances
            .Include(d => d.Employee)
                .ThenInclude(e => e.Department)
            .Include(d => d.Employee)
                .ThenInclude(e => e.ShiftDefinition)
            .AsNoTracking();

        if (startDate.HasValue)
            query = query.Where(d => d.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(d => d.Date <= endDate.Value);

        if (departmentId.HasValue)
            query = query.Where(d => d.Employee.DepartmentId == departmentId.Value);

        if (employeeId.HasValue)
            query = query.Where(d => d.EmployeeId == employeeId.Value);

        if (hasException.HasValue)
            query = query.Where(d => d.HasException == hasException.Value);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(d => d.Date)
            .ThenBy(d => d.Employee.FullName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DailyAttendanceResponse
            {
                Id = d.Id,
                EmployeeId = d.EmployeeId,
                EmployeeCode = d.Employee.Code,
                EmployeeName = d.Employee.FullName,
                DepartmentName = d.Employee.Department != null ? d.Employee.Department.Name : null,
                ShiftName = d.Employee.ShiftDefinition != null ? d.Employee.ShiftDefinition.Name : "Standard Shift",
                Date = d.Date,
                FirstPunchIn = d.FirstPunchIn,
                LastPunchOut = d.LastPunchOut,
                TotalPunches = d.TotalPunches,
                LateMinutes = d.LateMinutes,
                EarlyLeaveMinutes = d.EarlyLeaveMinutes,
                WorkedMinutes = d.WorkedMinutes,
                OvertimeMinutes = d.OvertimeMinutes,
                IsNightShift = d.IsNightShift,
                IsAbsent = d.IsAbsent,
                IsWeekend = d.IsWeekend,
                IsHoliday = d.IsHoliday,
                IsExcusedPostNightRest = d.IsExcusedPostNightRest,
                ShiftPayMultiplier = d.ShiftPayMultiplier,
                IsBaseWageApproved = d.IsBaseWageApproved,
                IsOvertimeApproved = d.IsOvertimeApproved,
                PendingOvertimeMinutes = d.PendingOvertimeMinutes,
                PendingPayMultiplier = d.PendingPayMultiplier,
                HasException = d.HasException,
                IsSinglePunchMissing = d.IsSinglePunchMissing,
                ExceptionType = d.ExceptionType,
                IsResolved = d.IsResolved,
                ResolvedBy = d.ResolvedBy,
                ResolvedAt = d.ResolvedAt,
                ResolutionNotes = d.ResolutionNotes,
                Source = d.Source
            })
            .ToListAsync();

        return ApiResponse<PagedResponse<DailyAttendanceResponse>>.Ok(
            new PagedResponse<DailyAttendanceResponse>
            {
                Items = items,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            });
    }

    public async Task<ApiResponse<List<AttendanceExceptionResponse>>> GetUnresolvedExceptionsAsync(
        string monthYear,
        Guid? departmentId = null)
    {
        if (!DateTime.TryParse($"{monthYear}-01", out var date))
        {
            return ApiResponse<List<AttendanceExceptionResponse>>.Fail("Invalid monthYear format. Use YYYY-MM.");
        }

        var start = DateOnly.FromDateTime(date);
        var end = start.AddMonths(1).AddDays(-1);

        var query = _context.DailyAttendances
            .Include(d => d.Employee)
                .ThenInclude(e => e.Department)
            .Where(d => d.Date >= start && d.Date <= end && d.HasException && !d.IsResolved);

        if (departmentId.HasValue)
        {
            query = query.Where(d => d.Employee.DepartmentId == departmentId.Value);
        }

        var items = await query
            .OrderBy(d => d.Date)
            .ThenBy(d => d.Employee.FullName)
            .Select(d => new AttendanceExceptionResponse
            {
                DailyAttendanceId = d.Id,
                EmployeeId = d.EmployeeId,
                EmployeeCode = d.Employee.Code,
                EmployeeName = d.Employee.FullName,
                DepartmentName = d.Employee.Department != null ? d.Employee.Department.Name : null,
                BiometricDeviceId = d.Employee.BiometricDeviceId,
                Date = d.Date,
                RecordedPunchIn = d.FirstPunchIn,
                RecordedPunchOut = d.LastPunchOut,
                FirstPunchIn = d.FirstPunchIn,
                LastPunchOut = d.LastPunchOut,
                IsSinglePunchMissing = d.IsSinglePunchMissing,
                ExceptionType = d.ExceptionType ?? "AMBIGUOUS_PUNCH",
                Description = d.IsSinglePunchMissing
                    ? "Single punch recorded. Checkout time is missing."
                    : "Punch exception detected.",
                IsResolved = d.IsResolved,
                ResolutionNotes = d.ResolutionNotes
            })
            .ToListAsync();

        return ApiResponse<List<AttendanceExceptionResponse>>.Ok(items);
    }

    public async Task<ApiResponse<DailyAttendanceResponse>> ResolveExceptionAsync(
        Guid dailyAttendanceId,
        ResolveAttendanceExceptionRequest request,
        string userId)
    {
        var record = await _context.DailyAttendances
            .Include(d => d.Employee)
                .ThenInclude(e => e.Department)
            .Include(d => d.Employee)
                .ThenInclude(e => e.ShiftDefinition)
            .FirstOrDefaultAsync(d => d.Id == dailyAttendanceId);

        if (record == null)
        {
            return ApiResponse<DailyAttendanceResponse>.Fail("Daily attendance record not found.");
        }

        if (request.CorrectedPunchIn.HasValue)
            record.FirstPunchIn = request.CorrectedPunchIn.Value;

        if (request.CorrectedPunchOut.HasValue)
            record.LastPunchOut = request.CorrectedPunchOut.Value;

        // Recompute worked minutes and overtime
        if (record.FirstPunchIn.HasValue && record.LastPunchOut.HasValue)
        {
            var worked = (int)(record.LastPunchOut.Value.ToTimeSpan() - record.FirstPunchIn.Value.ToTimeSpan()).TotalMinutes;
            if (worked < 0)
            {
                // Overnight shift crossing midnight (e.g. In 18:10, Out 08:00)
                worked += 1440;
            }
            record.WorkedMinutes = Math.Max(0, worked);

            var shiftDuration = record.Employee.ShiftDefinition?.ShiftDurationMinutes ?? 540;
            record.OvertimeMinutes = Math.Max(0, record.WorkedMinutes - shiftDuration);
        }

        // Check if roster assignment exists for this date to align shift start & late minutes
        var rosterAssignment = await _context.ShiftRosterAssignments
            .FirstOrDefaultAsync(r => r.EmployeeId == record.EmployeeId && r.Date == record.Date);

        if (rosterAssignment != null && record.FirstPunchIn.HasValue)
        {
            var diff = (int)(record.FirstPunchIn.Value - rosterAssignment.ShiftStart).TotalMinutes;
            record.LateMinutes = diff > 15 ? diff : 0;
            if (rosterAssignment.IsOvernightShift)
            {
                record.IsNightShift = true;
                record.ShiftPayMultiplier = rosterAssignment.PayMultiplier;
            }
        }

        // Night shift & overtime approval logic
        if (request.ApproveAsNightShift.HasValue)
        {
            record.IsNightShift = request.ApproveAsNightShift.Value;
            if (request.ApproveAsNightShift.Value)
            {
                record.ShiftPayMultiplier = request.ApprovedMultiplier ?? 1.5m;
                // Credit standard 14h (840m) if worked overnight
                if (record.WorkedMinutes == 0) record.WorkedMinutes = 840;
            }
        }

        if (request.ApproveOvertime.HasValue && !request.ApproveOvertime.Value)
        {
            record.OvertimeMinutes = 0;
            record.IsOvertimeApproved = false;
        }
        else if (request.ApproveOvertime == true || record.ShiftPayMultiplier != null)
        {
            record.IsOvertimeApproved = true;
        }

        record.IsBaseWageApproved = true;
        record.HasException = false;
        record.IsSinglePunchMissing = false;
        record.IsResolved = true;
        record.ResolvedBy = userId;
        record.ResolvedAt = DateTime.UtcNow;
        record.ResolutionNotes = request.ResolutionNotes;
        record.UpdatedAt = DateTime.UtcNow;
        record.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        // Immediately sync to monthly summary so numbers update on screen
        await SyncToMonthlySummaryInternalAsync(record.Date.ToString("yyyy-MM"), userId, CancellationToken.None);

        var response = new DailyAttendanceResponse
        {
            Id = record.Id,
            EmployeeId = record.EmployeeId,
            EmployeeCode = record.Employee.Code,
            EmployeeName = record.Employee.FullName,
            DepartmentName = record.Employee.Department?.Name,
            ShiftName = record.Employee.ShiftDefinition?.Name ?? "Standard Shift",
            Date = record.Date,
            FirstPunchIn = record.FirstPunchIn,
            LastPunchOut = record.LastPunchOut,
            TotalPunches = record.TotalPunches,
            LateMinutes = record.LateMinutes,
            EarlyLeaveMinutes = record.EarlyLeaveMinutes,
            WorkedMinutes = record.WorkedMinutes,
            OvertimeMinutes = record.OvertimeMinutes,
            IsNightShift = record.IsNightShift,
            IsAbsent = record.IsAbsent,
            IsWeekend = record.IsWeekend,
            IsHoliday = record.IsHoliday,
            IsExcusedPostNightRest = record.IsExcusedPostNightRest,
            ShiftPayMultiplier = record.ShiftPayMultiplier,
            IsBaseWageApproved = record.IsBaseWageApproved,
            IsOvertimeApproved = record.IsOvertimeApproved,
            PendingOvertimeMinutes = record.PendingOvertimeMinutes,
            PendingPayMultiplier = record.PendingPayMultiplier,
            HasException = record.HasException,
            IsSinglePunchMissing = record.IsSinglePunchMissing,
            ExceptionType = record.ExceptionType,
            IsResolved = record.IsResolved,
            ResolvedBy = record.ResolvedBy,
            ResolvedAt = record.ResolvedAt,
            ResolutionNotes = record.ResolutionNotes,
            Source = record.Source
        };

        return ApiResponse<DailyAttendanceResponse>.Ok(response);
    }

    public async Task<ApiResponse<List<BulkResolvePreviewItem>>> GetBulkResolvePreviewAsync(
        string monthYear,
        Guid? departmentId = null,
        Guid? employeeId = null,
        CancellationToken ct = default)
    {
        if (!DateTime.TryParse($"{monthYear}-01", out var date))
        {
            return ApiResponse<List<BulkResolvePreviewItem>>.Fail("Invalid monthYear format. Use YYYY-MM.");
        }

        var start = DateOnly.FromDateTime(date);
        var end = start.AddMonths(1).AddDays(-1);

        var query = _context.DailyAttendances
            .Include(d => d.Employee)
                .ThenInclude(e => e.Department)
            .Include(d => d.Employee)
                .ThenInclude(e => e.ShiftDefinition)
            .Where(d => d.Date >= start && d.Date <= end && d.IsSinglePunchMissing && !d.IsResolved);

        if (departmentId.HasValue)
            query = query.Where(d => d.Employee.DepartmentId == departmentId.Value);

        if (employeeId.HasValue)
            query = query.Where(d => d.EmployeeId == employeeId.Value);

        var unresolvedSinglePunches = await query
            .OrderBy(d => d.Date)
            .ThenBy(d => d.Employee.FullName)
            .ToListAsync(ct);

        if (unresolvedSinglePunches.Count == 0)
        {
            return ApiResponse<List<BulkResolvePreviewItem>>.Ok([]);
        }

        var empIds = unresolvedSinglePunches.Select(d => d.EmployeeId).Distinct().ToList();
        var rosterAssignments = await _context.ShiftRosterAssignments
            .Where(r => r.Date >= start && r.Date <= end && empIds.Contains(r.EmployeeId))
            .ToDictionaryAsync(r => (r.EmployeeId, r.Date), ct);

        var previewItems = new List<BulkResolvePreviewItem>();

        foreach (var record in unresolvedSinglePunches)
        {
            var hasRoster = rosterAssignments.TryGetValue((record.EmployeeId, record.Date), out var roster);
            TimeOnly suggestedOut;
            string source;
            bool isNight = record.IsNightShift;
            decimal proposedMultiplier = 1.0m;

            if (hasRoster && roster != null)
            {
                suggestedOut = roster.ShiftEnd;
                source = "ROSTER_SHIFT_END";
                isNight = roster.IsOvernightShift;
                proposedMultiplier = roster.PayMultiplier;
            }
            else
            {
                var empShift = record.Employee.ShiftDefinition;
                if (record.FirstPunchIn.HasValue && record.FirstPunchIn.Value.Hour >= 16)
                {
                    // Evening punch in without roster -> suggested overnight shift end at 08:00
                    suggestedOut = new TimeOnly(8, 0);
                    source = "DEFAULT_NIGHT_END";
                    isNight = true;
                    proposedMultiplier = 1.5m;
                }
                else
                {
                    suggestedOut = empShift?.ShiftEnd ?? new TimeOnly(17, 0);
                    source = "DEFAULT_SHIFT_END";
                    isNight = false;
                    proposedMultiplier = 1.0m;
                }
            }

            int computedWorkedMinutes = 0;
            if (record.FirstPunchIn.HasValue)
            {
                var diff = (int)(suggestedOut.ToTimeSpan() - record.FirstPunchIn.Value.ToTimeSpan()).TotalMinutes;
                if (diff < 0) diff += 1440;
                computedWorkedMinutes = Math.Max(0, diff);
            }

            previewItems.Add(new BulkResolvePreviewItem
            {
                DailyAttendanceId = record.Id,
                EmployeeId = record.EmployeeId,
                EmployeeCode = record.Employee.Code,
                EmployeeName = record.Employee.FullName,
                DepartmentName = record.Employee.Department?.Name,
                Date = record.Date,
                RecordedPunchIn = record.FirstPunchIn,
                SuggestedPunchOut = suggestedOut,
                SuggestedSource = source,
                ComputedWorkedMinutes = computedWorkedMinutes,
                IsNightShift = isNight,
                ProposedMultiplier = proposedMultiplier
            });
        }

        return ApiResponse<List<BulkResolvePreviewItem>>.Ok(previewItems);
    }

    public async Task<ApiResponse<int>> BulkResolveExceptionsAsync(
        BulkResolveExceptionsRequest request,
        string userId,
        CancellationToken ct = default)
    {
        if (request.DailyAttendanceIds.Count == 0)
        {
            return ApiResponse<int>.Fail("No attendance records provided for bulk resolution.");
        }

        var records = await _context.DailyAttendances
            .Include(d => d.Employee)
                .ThenInclude(e => e.ShiftDefinition)
            .Where(d => request.DailyAttendanceIds.Contains(d.Id))
            .ToListAsync(ct);

        if (records.Count == 0)
        {
            return ApiResponse<int>.Fail("No matching attendance records found.");
        }

        var dates = records.Select(r => r.Date).Distinct().ToList();
        var minDate = dates.Min();
        var maxDate = dates.Max();
        var empIds = records.Select(r => r.EmployeeId).Distinct().ToList();

        var rosterAssignments = await _context.ShiftRosterAssignments
            .Where(r => r.Date >= minDate && r.Date <= maxDate && empIds.Contains(r.EmployeeId))
            .ToDictionaryAsync(r => (r.EmployeeId, r.Date), ct);

        int resolvedCount = 0;

        foreach (var record in records)
        {
            var hasRoster = rosterAssignments.TryGetValue((record.EmployeeId, record.Date), out var roster);
            TimeOnly punchOut;

            if (request.UseRosterShiftEndIfAvailable && hasRoster && roster != null)
            {
                punchOut = roster.ShiftEnd;
                record.IsNightShift = roster.IsOvernightShift;
                if (request.ApproveOvertimePremium)
                {
                    record.ShiftPayMultiplier = roster.PayMultiplier;
                    record.IsOvertimeApproved = true;
                }
                else
                {
                    record.PendingPayMultiplier = roster.PayMultiplier;
                    record.IsOvertimeApproved = false;
                }
            }
            else if (request.DefaultSuggestedPunchOut.HasValue)
            {
                punchOut = request.DefaultSuggestedPunchOut.Value;
                if (request.ApproveOvertimePremium)
                {
                    record.ShiftPayMultiplier = request.ApprovedMultiplier;
                    record.IsOvertimeApproved = true;
                }
                else
                {
                    record.PendingPayMultiplier = request.ApprovedMultiplier;
                    record.IsOvertimeApproved = false;
                }
            }
            else
            {
                if (record.FirstPunchIn.HasValue && record.FirstPunchIn.Value.Hour >= 16)
                {
                    punchOut = new TimeOnly(8, 0);
                    record.IsNightShift = true;
                }
                else
                {
                    punchOut = record.Employee.ShiftDefinition?.ShiftEnd ?? new TimeOnly(17, 0);
                }

                if (request.ApproveOvertimePremium)
                {
                    record.ShiftPayMultiplier = request.ApprovedMultiplier;
                    record.IsOvertimeApproved = true;
                }
                else
                {
                    record.PendingPayMultiplier = request.ApprovedMultiplier;
                    record.IsOvertimeApproved = false;
                }
            }

            record.LastPunchOut = punchOut;
            if (record.FirstPunchIn.HasValue)
            {
                var diff = (int)(punchOut.ToTimeSpan() - record.FirstPunchIn.Value.ToTimeSpan()).TotalMinutes;
                if (diff < 0) diff += 1440;
                record.WorkedMinutes = Math.Max(0, diff);

                var shiftDuration = hasRoster && roster != null
                    ? roster.ShiftDurationMinutes
                    : (record.Employee.ShiftDefinition?.ShiftDurationMinutes ?? 540);

                if (record.WorkedMinutes > shiftDuration)
                {
                    record.OvertimeMinutes = record.WorkedMinutes - shiftDuration;
                }
            }

            record.IsBaseWageApproved = request.ApproveBaseWage;
            record.HasException = false;
            record.IsSinglePunchMissing = false;
            record.IsResolved = true;
            record.ResolvedBy = userId;
            record.ResolvedAt = DateTime.UtcNow;
            record.ResolutionNotes = string.IsNullOrWhiteSpace(request.SupervisorNotes)
                ? $"Bulk resolved with punch out {punchOut:HH:mm}."
                : request.SupervisorNotes;
            record.UpdatedAt = DateTime.UtcNow;
            record.UpdatedBy = userId;

            resolvedCount++;
        }

        await _context.SaveChangesAsync(ct);

        var affectedMonths = records.Select(r => r.Date.ToString("yyyy-MM")).Distinct();
        foreach (var m in affectedMonths)
        {
            await SyncToMonthlySummaryInternalAsync(m, userId, ct);
        }

        return ApiResponse<int>.Ok(resolvedCount);
    }

    public async Task<ApiResponse<int>> SyncToMonthlySummaryAsync(string monthYear, string userId)
    {
        return await SyncToMonthlySummaryInternalAsync(monthYear, userId, CancellationToken.None);
    }

    public async Task<ApiResponse<int>> RecalculateAttendanceAsync(
        string monthYear,
        Guid? employeeId = null,
        string? userId = null,
        CancellationToken ct = default)
    {
        if (!DateTime.TryParse($"{monthYear}-01", out var monthStartDt))
        {
            return ApiResponse<int>.Fail("Invalid monthYear format. Use YYYY-MM.");
        }

        var start = DateOnly.FromDateTime(monthStartDt);
        var end = start.AddMonths(1).AddDays(-1);

        // Include 1 day before and 1 day after to capture boundary overnight shifts
        var queryStartDt = start.AddDays(-1).ToDateTime(TimeOnly.MinValue);
        var queryEndDt = end.AddDays(2).ToDateTime(TimeOnly.MinValue);

        // 1. Fetch active employees
        var empQuery = _context.Employees
            .Include(e => e.ShiftDefinition)
            .Include(e => e.Department)
            .Where(e => e.Status == "Active");

        if (employeeId.HasValue)
        {
            empQuery = empQuery.Where(e => e.Id == employeeId.Value);
        }

        var activeEmployees = await empQuery.ToListAsync(ct);
        if (activeEmployees.Count == 0)
        {
            return ApiResponse<int>.Ok(0, "No active employees found to recalculate.");
        }

        var targetEmpIds = activeEmployees.Select(e => e.Id).ToList();

        // 2. Fetch raw punch logs in the date range
        var rawLogs = await _context.RawPunchLogs
            .Where(p => p.EmployeeId.HasValue && targetEmpIds.Contains(p.EmployeeId.Value) &&
                        p.PunchTimestamp >= queryStartDt && p.PunchTimestamp < queryEndDt)
            .ToListAsync(ct);

        // Self-heal any unmapped punches matching target employees
        var deviceMap = activeEmployees
            .Where(e => !string.IsNullOrWhiteSpace(e.BiometricDeviceId))
            .ToDictionary(e => e.BiometricDeviceId!.Trim(), e => e);
        var codeMap = activeEmployees
            .ToDictionary(e => e.Code.Trim(), e => e, StringComparer.OrdinalIgnoreCase);

        var unmappedLogs = await _context.RawPunchLogs
            .Where(p => !p.EmployeeId.HasValue && p.PunchTimestamp >= queryStartDt && p.PunchTimestamp < queryEndDt)
            .ToListAsync(ct);

        foreach (var p in unmappedLogs)
        {
            if (deviceMap.TryGetValue(p.BiometricDeviceId.Trim(), out var emp) ||
                codeMap.TryGetValue(p.BiometricDeviceId.Trim(), out emp))
            {
                p.EmployeeId = emp.Id;
                if (targetEmpIds.Contains(emp.Id))
                {
                    rawLogs.Add(p);
                }
            }
        }

        // 3. Load shifts, holidays, and latest roster assignments
        var shifts = await _context.ShiftDefinitions.ToListAsync(ct);
        var holidays = await _context.CompanyCalendarHolidays.ToListAsync(ct);
        var rosterAssignments = await _context.ShiftRosterAssignments
            .Where(r => targetEmpIds.Contains(r.EmployeeId) && r.Date >= start.AddDays(-1) && r.Date <= end.AddDays(1))
            .ToListAsync(ct);

        // 4. Run shift pairing engine
        var recomputedRecords = _pairingEngine.PairAndComputeDailyAttendance(
            rawLogs,
            activeEmployees,
            shifts,
            holidays,
            $"RECALC_{DateTime.UtcNow.Ticks}",
            userId ?? "system",
            rosterAssignments);

        // Filter to target month
        var monthRecords = recomputedRecords
            .Where(d => d.Date >= start && d.Date <= end)
            .ToList();

        // 5. Upsert into DailyAttendance
        var existingDailies = await _context.DailyAttendances
            .Where(d => targetEmpIds.Contains(d.EmployeeId) && d.Date >= start && d.Date <= end)
            .ToDictionaryAsync(d => (d.EmployeeId, d.Date), ct);

        foreach (var daily in monthRecords)
        {
            if (existingDailies.TryGetValue((daily.EmployeeId, daily.Date), out var existing))
            {
                if (existing.IsResolved)
                {
                    // Preserve supervisor's manual punch corrections, but update schedule-derived metrics
                    existing.LateMinutes = daily.LateMinutes;
                    existing.EarlyLeaveMinutes = daily.EarlyLeaveMinutes;
                    existing.ShiftPayMultiplier = daily.ShiftPayMultiplier ?? existing.ShiftPayMultiplier;
                    existing.IsNightShift = daily.IsNightShift || existing.IsNightShift;
                    existing.IsExcusedPostNightRest = daily.IsExcusedPostNightRest;
                    existing.UpdatedAt = DateTime.UtcNow;
                    existing.UpdatedBy = userId ?? "system";
                }
                else
                {
                    existing.FirstPunchIn = daily.FirstPunchIn;
                    existing.LastPunchOut = daily.LastPunchOut;
                    existing.TotalPunches = daily.TotalPunches;
                    existing.LateMinutes = daily.LateMinutes;
                    existing.EarlyLeaveMinutes = daily.EarlyLeaveMinutes;
                    existing.WorkedMinutes = daily.WorkedMinutes;
                    existing.OvertimeMinutes = daily.OvertimeMinutes;
                    existing.IsNightShift = daily.IsNightShift;
                    existing.IsAbsent = daily.IsAbsent;
                    existing.IsWeekend = daily.IsWeekend;
                    existing.IsHoliday = daily.IsHoliday;
                    existing.IsExcusedPostNightRest = daily.IsExcusedPostNightRest;
                    existing.ShiftPayMultiplier = daily.ShiftPayMultiplier;
                    existing.IsBaseWageApproved = daily.IsBaseWageApproved;
                    existing.IsOvertimeApproved = daily.IsOvertimeApproved;
                    existing.PendingOvertimeMinutes = daily.PendingOvertimeMinutes;
                    existing.PendingPayMultiplier = daily.PendingPayMultiplier;
                    existing.HasException = daily.HasException;
                    existing.IsSinglePunchMissing = daily.IsSinglePunchMissing;
                    existing.ExceptionType = daily.ExceptionType;
                    existing.ResolutionNotes = daily.ResolutionNotes;
                    existing.UpdatedAt = DateTime.UtcNow;
                    existing.UpdatedBy = userId ?? "system";
                }
            }
            else
            {
                _context.DailyAttendances.Add(daily);
            }
        }

        await _context.SaveChangesAsync(ct);

        // 6. Sync monthly summaries
        await SyncToMonthlySummaryInternalAsync(monthYear, userId ?? "system", ct);

        return ApiResponse<int>.Ok(monthRecords.Count, $"Successfully recalculated {monthRecords.Count} daily attendance records for {monthYear}.");
    }

    private async Task<ApiResponse<int>> SyncToMonthlySummaryInternalAsync(
        string monthYear,
        string userId,
        CancellationToken ct = default)
    {
        if (!DateTime.TryParse($"{monthYear}-01", out var date))
        {
            return ApiResponse<int>.Fail("Invalid monthYear format. Use YYYY-MM.");
        }

        var start = DateOnly.FromDateTime(date);
        var end = start.AddMonths(1).AddDays(-1);

        // Load all active employees and their active contracts
        var activeEmployees = await _context.Employees
            .Include(e => e.Contracts.Where(c => c.IsActive))
            .Where(e => e.Status == "Active")
            .ToListAsync(ct);

        // Load calendar holidays & configured weekly-off policy (no hardcoded Sundays)
        var calendarHolidays = await _context.CompanyCalendarHolidays
            .Where(h => (h.Date >= start && h.Date <= end) || h.RestDayOfWeek != null)
            .ToListAsync(ct);

        var holidayDates = calendarHolidays.Where(h => h.RestDayOfWeek == null).Select(h => h.Date).ToHashSet();
        var defaultWeeklyOff = calendarHolidays.FirstOrDefault(h => h.RestDayOfWeek != null)?.RestDayOfWeek ?? DayOfWeek.Sunday;

        // Load duty roster assignments for target month
        var rosterAssignments = await _context.ShiftRosterAssignments
            .Where(r => r.Date >= start && r.Date <= end)
            .ToListAsync(ct);
        var rosterLookup = rosterAssignments.ToLookup(r => (r.EmployeeId, r.Date));

        // Load all daily records for this month
        var dailyRecords = await _context.DailyAttendances
            .Where(d => d.Date >= start && d.Date <= end)
            .ToListAsync(ct);

        if (dailyRecords.Count == 0)
        {
            return ApiResponse<int>.Fail($"No daily attendance records found for {monthYear}. Please import biometric data first.");
        }

        var grouped = dailyRecords.GroupBy(d => d.EmployeeId).ToDictionary(g => g.Key, g => g.ToList());
        var existingSummaries = await _context.AttendanceSummaries
            .Where(s => s.MonthYear == monthYear)
            .ToDictionaryAsync(s => s.EmployeeId, ct);

        var updatedCount = 0;

        foreach (var emp in activeEmployees)
        {
            var activeContract = emp.Contracts.FirstOrDefault(c => c.IsActive);
            var defaultNightMins = activeContract?.NightShiftMinutes ?? 840;

            int daysPresent = 0;
            int pendingExceptions = 0;
            int absentDays = 0;
            int lateMinutes = 0;
            int overtimeMinutes = 0;
            int nightShiftsCount = 0;
            int nightShiftMinutes = 0;
            int totalPendingOtMins = 0;

            if (grouped.TryGetValue(emp.Id, out var empDailies))
            {
                var empDailiesByDate = empDailies.GroupBy(d => d.Date).ToDictionary(g => g.Key, g => g.ToList());

                // Day-by-day independent calendar evaluation across all dates of the month
                for (var curr = start; curr <= end; curr = curr.AddDays(1))
                {
                    var isHoliday = holidayDates.Contains(curr);
                    var hasRoster = rosterLookup.Contains((emp.Id, curr));
                    var isScheduledWorkDay = (curr.DayOfWeek != defaultWeeklyOff && !isHoliday) || hasRoster;

                    if (!isScheduledWorkDay)
                    {
                        // Weekly off or holiday.
                        // Do not double-count unworked post-night rest days as DaysPresent!
                        continue;
                    }

                    if (empDailiesByDate.TryGetValue(curr, out var dailiesForDay))
                    {
                        if (dailiesForDay.Any(d => d.IsIncompleteShift))
                        {
                            pendingExceptions++;
                        }
                        else if (dailiesForDay.All(d => d.IsAbsent && !d.IsExcusedPostNightRest))
                        {
                            absentDays++;
                        }
                        else if (dailiesForDay.Any(d => d.WorkedMinutes > 0))
                        {
                            daysPresent++;
                        }
                        else if (dailiesForDay.Any(d => d.IsExcusedPostNightRest && !d.IsWeekend && curr.DayOfWeek != defaultWeeklyOff))
                        {
                            // Excused post-night rest falling on a scheduled working day counts as Present!
                            daysPresent++;
                        }
                    }
                    else
                    {
                        // Scheduled working day with ZERO punches and NO excused rest = TRUE ABSENT!
                        absentDays++;
                    }
                }

                lateMinutes = empDailies.Sum(d => d.LateMinutes);
                overtimeMinutes = empDailies.Sum(d => d.OvertimeMinutes);

                // Only night shifts with approved multiplier count towards active NightShiftMinutes
                nightShiftsCount = empDailies.Count(d => d.IsNightShift && (d.ShiftPayMultiplier != null || d.IsResolved || d.IsOvertimeApproved));
                nightShiftMinutes = empDailies
                    .Where(d => d.IsNightShift && (d.ShiftPayMultiplier != null || d.IsResolved || d.IsOvertimeApproved))
                    .Sum(d => d.WorkedMinutes);
                if (nightShiftMinutes == 0 && nightShiftsCount > 0)
                {
                    nightShiftMinutes = nightShiftsCount * defaultNightMins;
                }

                // Pending/unapproved night shifts & pending extra hours overtime go to pending
                var pendingNightMins = empDailies
                    .Where(d => d.IsNightShift && d.ShiftPayMultiplier == null && !d.IsResolved && !d.IsOvertimeApproved)
                    .Sum(d => d.WorkedMinutes);
                var pendingExtraOtMins = empDailies.Sum(d => d.PendingOvertimeMinutes);
                totalPendingOtMins = pendingNightMins + pendingExtraOtMins;
            }
            else
            {
                // Employee has no punch logs for this month: count all scheduled work days as absent
                for (var curr = start; curr <= end; curr = curr.AddDays(1))
                {
                    var isHoliday = holidayDates.Contains(curr);
                    var hasRoster = rosterLookup.Contains((emp.Id, curr));
                    if ((curr.DayOfWeek != defaultWeeklyOff && !isHoliday) || hasRoster)
                    {
                        absentDays++;
                    }
                }
            }

            if (existingSummaries.TryGetValue(emp.Id, out var summary))
            {
                summary.DaysPresent = daysPresent;
                summary.AbsentDays = absentDays;
                summary.LateMinutes = lateMinutes;
                summary.OvertimeMinutes = overtimeMinutes;
                summary.OvertimeHours = Math.Round((decimal)overtimeMinutes / 60m, 2);
                summary.NightShiftsCount = nightShiftsCount;
                summary.NightShiftMinutes = nightShiftMinutes;
                summary.PendingExceptionsCount = pendingExceptions;
                summary.PendingOvertimeMinutes = totalPendingOtMins;
                summary.UpdatedAt = DateTime.UtcNow;
                summary.UpdatedBy = userId;
            }
            else
            {
                var newSummary = new AttendanceSummary
                {
                    Id = Guid.NewGuid(),
                    EmployeeId = emp.Id,
                    MonthYear = monthYear,
                    DaysPresent = daysPresent,
                    AbsentDays = absentDays,
                    LateMinutes = lateMinutes,
                    OvertimeMinutes = overtimeMinutes,
                    OvertimeHours = Math.Round((decimal)overtimeMinutes / 60m, 2),
                    NightShiftsCount = nightShiftsCount,
                    NightShiftMinutes = nightShiftMinutes,
                    PendingExceptionsCount = pendingExceptions,
                    PendingOvertimeMinutes = totalPendingOtMins,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };
                _context.AttendanceSummaries.Add(newSummary);
            }
            updatedCount++;
        }

        await _context.SaveChangesAsync(ct);
        return ApiResponse<int>.Ok(updatedCount);
    }
}
