import api from "./axios"
import type { ApiResponse } from "@/types"
import type {
  AttendanceSummaryDto,
  UpsertAttendanceRequest,
  BulkUpsertAttendanceRequest,
  AttendanceFilterParams,
} from "@/types/attendance.types"

export async function getMonthAttendance(params: AttendanceFilterParams) {
  const response = await api.get<ApiResponse<AttendanceSummaryDto[]>>("/api/v1/attendance", { params })
  return response.data.data
}

export async function upsertAttendance(data: UpsertAttendanceRequest) {
  const response = await api.post<ApiResponse<AttendanceSummaryDto>>("/api/v1/attendance", data)
  return response.data.data
}

export async function bulkUpsertAttendance(data: BulkUpsertAttendanceRequest) {
  const response = await api.post<ApiResponse<number>>("/api/v1/attendance/bulk", data)
  return response.data.data
}

