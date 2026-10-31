import type { PayType } from "./employee.types"

export interface AttendanceSummaryDto {
  id: string
  employeeId: string
  employeeCode: string
  employeeName: string
  category: string
  departmentName: string | null
  payType: PayType
  basicRate: number
  dailyShiftHours: number
  defaultNightShiftMinutes: number
  monthYear: string
  daysPresent: number
  absentDays: number
  lateMinutes: number
  overtimeHours: number
  overtimeMinutes: number
  nightShiftsCount: number
  nightShiftMinutes: number
  pendingExceptionsCount: number
  pendingOvertimeMinutes: number
  updatedAt: string | null
}

export interface UpsertAttendanceItem {
  employeeId: string
  daysPresent: number
  absentDays: number
  lateMinutes: number
  overtimeMinutes: number
  overtimeHours: number
  nightShiftsCount: number
  nightShiftMinutes?: number
}

export interface UpsertAttendanceRequest {
  monthYear: string
  item: UpsertAttendanceItem
}

export interface BulkUpsertAttendanceRequest {
  monthYear: string
  items: UpsertAttendanceItem[]
}

export interface AttendanceFilterParams {
  monthYear: string
  category?: string
  departmentId?: string
  search?: string
}

