export interface ShiftRosterAssignmentDto {
  id: string
  employeeId: string
  employeeCode: string
  employeeName: string
  departmentName?: string | null
  date: string // YYYY-MM-DD
  shiftName: string
  shiftStart: string // HH:mm:ss
  shiftEnd: string // HH:mm:ss
  shiftDurationMinutes: number
  isOvernightShift: boolean
  payMultiplier: number
  excuseOverlappingDayShift: boolean
  reason?: string | null
  createdBy: string
  createdAt: string
}

export interface BulkAssignRosterRequest {
  employeeIds: string[]
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  shiftName: string
  shiftStart: string // HH:mm
  shiftEnd: string // HH:mm
  shiftDurationMinutes: number
  isOvernightShift: boolean
  payMultiplier: number
  excuseOverlappingDayShift: boolean
  reason?: string
}

export interface ShiftRosterCalendarResponse {
  monthYear: string
  assignments: ShiftRosterAssignmentDto[]
  totalAssignedNights: number
  totalWorkersScheduled: number
}

