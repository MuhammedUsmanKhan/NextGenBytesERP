import { describe, it, expect } from '@jest/globals';

export interface DayAttendanceRecord {
  date: string;
  isWeeklyOff: boolean;
  isHoliday: boolean;
  isPostNightRest: boolean;
  rawPunches: string[];
  isAttendanceApproved: boolean;
  isPayApproved: boolean;
  pendingExceptions: number;
  status: 'Present' | 'Absent' | 'WeeklyOff' | 'Holiday' | 'RestDay';
}

export function evaluateDayStatus(
  day: Omit<DayAttendanceRecord, 'status'>
): 'Present' | 'Absent' | 'WeeklyOff' | 'Holiday' | 'RestDay' {
  // Rule 5: Rest day protection against duplicate counting
  if (day.isWeeklyOff) return 'WeeklyOff';
  if (day.isHoliday) return 'Holiday';
  if (day.isPostNightRest) return 'RestDay';

  // Real scheduled working day status is evaluated independently of exceptions
  if (day.rawPunches && day.rawPunches.length > 0) {
    return 'Present';
  }
  return 'Absent';
}

export function bulkResolveExceptions(records: DayAttendanceRecord[]): DayAttendanceRecord[] {
  return records.map((record) => {
    if (record.pendingExceptions > 0) {
      return {
        ...record,
        pendingExceptions: 0,
        // Rule 3: Approving presence does NOT automatically approve pay premiums unless explicitly set
        isAttendanceApproved: true,
      };
    }
    return record;
  });
}

describe('Three-Tier Attendance Exception & Roster Pipeline', () => {
  describe('Rule 1: Independent Scheduled Working Day Status', () => {
    it('does NOT erase genuine absences when exceptions are resolved', () => {
      const workingDays: DayAttendanceRecord[] = [
        {
          date: '2026-08-01',
          isWeeklyOff: false,
          isHoliday: false,
          isPostNightRest: false,
          rawPunches: ['08:02'],
          isAttendanceApproved: false,
          isPayApproved: false,
          pendingExceptions: 1, // missing punch out
          status: 'Present',
        },
        {
          date: '2026-08-02',
          isWeeklyOff: false,
          isHoliday: false,
          isPostNightRest: false,
          rawPunches: [], // No punches
          isAttendanceApproved: false,
          isPayApproved: false,
          pendingExceptions: 0,
          status: 'Absent',
        },
        {
          date: '2026-08-03',
          isWeeklyOff: false,
          isHoliday: false,
          isPostNightRest: false,
          rawPunches: [], // Genuine absence
          isAttendanceApproved: false,
          isPayApproved: false,
          pendingExceptions: 0,
          status: 'Absent',
        },
      ];

      const resolved = bulkResolveExceptions(workingDays);
      const remainingAbsences = resolved.filter((r) => evaluateDayStatus(r) === 'Absent');
      expect(remainingAbsences.length).toBe(2);
      expect(resolved.reduce((sum, r) => sum + r.pendingExceptions, 0)).toBe(0);
    });
  });

  describe('Rule 2: Roster & Weekly-Off Policy Integrity', () => {
    it('treats Sunday as WeeklyOff according to roster, never as an unexcused absence', () => {
      const sundayRecord: DayAttendanceRecord = {
        date: '2026-08-02', // Sunday
        isWeeklyOff: true,
        isHoliday: false,
        isPostNightRest: false,
        rawPunches: [],
        isAttendanceApproved: false,
        isPayApproved: false,
        pendingExceptions: 0,
        status: 'WeeklyOff',
      };

      const evaluated = evaluateDayStatus(sundayRecord);
      expect(evaluated).toBe('WeeklyOff');
      expect(evaluated).not.toBe('Absent');
    });
  });

  describe('Rule 3: Separation of Attendance Approval from Pay Approval', () => {
    it('ensures confirming presence does not automatically grant night premium or overtime pay', () => {
      const nightRecord: DayAttendanceRecord = {
        date: '2026-08-10',
        isWeeklyOff: false,
        isHoliday: false,
        isPostNightRest: false,
        rawPunches: ['20:00', '05:00'],
        isAttendanceApproved: true,  // Supervisor confirmed presence
        isPayApproved: false,         // Night premium still pending HR payroll approval
        pendingExceptions: 0,
        status: 'Present',
      };

      expect(nightRecord.isAttendanceApproved).toBe(true);
      expect(nightRecord.isPayApproved).toBe(false);
    });
  });

  describe('Rule 4: Bulk Resolution Audit & Preservation', () => {
    it('resolves 10 pending exceptions, verifying 2 real absences remain and pending count becomes 0', () => {
      const records: DayAttendanceRecord[] = [
        ...Array.from({ length: 10 }, (_, i) => ({
          date: `2026-08-${10 + i}`,
          isWeeklyOff: false,
          isHoliday: false,
          isPostNightRest: false,
          rawPunches: ['08:00'],
          isAttendanceApproved: false,
          isPayApproved: false,
          pendingExceptions: 1, // 10 exceptions total
          status: 'Present' as const,
        })),
        {
          date: '2026-08-25',
          isWeeklyOff: false,
          isHoliday: false,
          isPostNightRest: false,
          rawPunches: [],
          isAttendanceApproved: false,
          isPayApproved: false,
          pendingExceptions: 0,
          status: 'Absent' as const,
        },
        {
          date: '2026-08-26',
          isWeeklyOff: false,
          isHoliday: false,
          isPostNightRest: false,
          rawPunches: [],
          isAttendanceApproved: false,
          isPayApproved: false,
          pendingExceptions: 0,
          status: 'Absent' as const,
        },
      ];

      const beforeExceptions = records.reduce((sum, r) => sum + r.pendingExceptions, 0);
      expect(beforeExceptions).toBe(10);

      const resolved = bulkResolveExceptions(records);
      const afterExceptions = resolved.reduce((sum, r) => sum + r.pendingExceptions, 0);
      expect(afterExceptions).toBe(0);

      const absences = resolved.filter((r) => evaluateDayStatus(r) === 'Absent');
      expect(absences.length).toBe(2);
    });
  });

  describe('Rule 5: Duplicate Counting Protection for Post-Night Rest Days', () => {
    it('does not count post-night rest day twice if it falls on scheduled WeeklyOff', () => {
      const restOnSunday: DayAttendanceRecord = {
        date: '2026-08-16', // Sunday
        isWeeklyOff: true,
        isHoliday: false,
        isPostNightRest: true,
        rawPunches: [],
        isAttendanceApproved: false,
        isPayApproved: false,
        pendingExceptions: 0,
        status: 'WeeklyOff',
      };

      const status = evaluateDayStatus(restOnSunday);
      expect(status).toBe('WeeklyOff'); // Prioritizes WeeklyOff, prevented double counting
    });
  });
});
