export const GraceDeductionMode = {
  DeductAllFromStart: 1,
  DeductExcessPastGrace: 2,
} as const
export type GraceDeductionMode = (typeof GraceDeductionMode)[keyof typeof GraceDeductionMode]

export interface DailyAttendanceDto {
  id: string
  employeeId: string
  employeeCode: string
  employeeName: string
  departmentName?: string | null
  shiftName?: string | null
  date: string // YYYY-MM-DD
  firstPunchIn?: string | null // HH:mm:ss
  lastPunchOut?: string | null // HH:mm:ss
  totalPunches: number
  lateMinutes: number
  earlyLeaveMinutes: number
  workedMinutes: number
  overtimeMinutes: number
  isNightShift: boolean
  isAbsent: boolean
  isWeekend: boolean
  isHoliday: boolean
  hasException: boolean
  isSinglePunchMissing: boolean
  exceptionType?: string | null
  isBaseWageApproved?: boolean
  isOvertimeApproved?: boolean
  pendingOvertimeMinutes?: number
  pendingPayMultiplier?: number | null
  isResolved: boolean
  resolvedBy?: string | null
  resolvedAt?: string | null
  resolutionNotes?: string | null
}

export interface BulkResolvePreviewItem {
  dailyAttendanceId: string
  employeeId: string
  employeeCode: string
  employeeName: string
  departmentName?: string | null
  date: string
  recordedPunchIn?: string | null
  suggestedPunchOut?: string | null
  suggestedSource: string
  computedWorkedMinutes: number
  isNightShift: boolean
  proposedMultiplier: number
}

export interface BulkResolveExceptionsRequest {
  dailyAttendanceIds: string[]
  defaultSuggestedPunchOut?: string | null
  useRosterShiftEndIfAvailable: boolean
  approveBaseWage: boolean
  approveOvertimePremium: boolean
  approvedMultiplier: number
  supervisorNotes: string
}

export interface AttendanceExceptionDto {
  dailyAttendanceId: string
  employeeId: string
  employeeCode: string
  employeeName: string
  departmentName?: string | null
  biometricDeviceId?: string | null
  date: string
  firstPunchIn?: string | null
  lastPunchOut?: string | null
  recordedPunchIn?: string | null
  recordedPunchOut?: string | null
  totalPunches?: number
  exceptionType?: string | null
  description?: string | null
  isSinglePunchMissing: boolean
  isResolved?: boolean
  resolutionNotes?: string | null
}

export interface ResolveAttendanceExceptionRequest {
  punchInTime?: string | null
  punchOutTime?: string | null
  markPresentWithStandardHours?: boolean
  approveAsNightShift?: boolean
  approveOvertime?: boolean
  approvedMultiplier?: number
  notes: string
}

export interface BiometricUploadResponseDto {
  batchId: string
  totalLinesRead: number
  validPunchesImported: number
  discardedResetPunches: number
  unmappedPunches: number
  dailyRecordsCreated: number
  exceptionsFlagged: number
  unmappedBiometricIds: string[]
}

export interface ShiftDefinitionDto {
  id: string
  name: string
  departmentId?: string | null
  departmentName?: string | null
  shiftStart: string // HH:mm:ss
  shiftEnd: string // HH:mm:ss
  shiftDurationMinutes: number
  graceLateMinutes: number
  graceMode: GraceDeductionMode
  isOvernightShift: boolean
  nightShiftStart?: string
  nightShiftEnd?: string
  isActive: boolean
  assignedEmployeeCount?: number
}

export interface CreateShiftDefinitionRequest {
  name: string
  departmentId?: string | null
  shiftStart: string // HH:mm:ss
  shiftEnd: string // HH:mm:ss
  shiftDurationMinutes: number
  graceLateMinutes: number
  graceMode: GraceDeductionMode
  isOvernightShift: boolean
  nightShiftStart?: string
  nightShiftEnd?: string
}

export interface UpdateShiftDefinitionRequest {
  name: string
  departmentId?: string | null
  shiftStart: string // HH:mm:ss
  shiftEnd: string // HH:mm:ss
  shiftDurationMinutes: number
  graceLateMinutes: number
  graceMode: GraceDeductionMode
  isOvernightShift: boolean
  nightShiftStart?: string
  nightShiftEnd?: string
  isActive: boolean
}

export interface DailyAttendanceFilterParams {
  startDate?: string
  endDate?: string
  departmentId?: string
  employeeId?: string
  hasException?: boolean
  page?: number
  pageSize?: number
}

