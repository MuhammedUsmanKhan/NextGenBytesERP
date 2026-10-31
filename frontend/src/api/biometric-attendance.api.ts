import api from "./axios"
import type { ApiResponse, PagedResponse } from "@/types"
import type {
  DailyAttendanceDto,
  DailyAttendanceFilterParams,
  AttendanceExceptionDto,
  ResolveAttendanceExceptionRequest,
  BulkResolvePreviewItem,
  BulkResolveExceptionsRequest,
  BiometricUploadResponseDto,
} from "@/types/biometric-attendance.types"

export async function uploadBiometricDatFile(file: File): Promise<BiometricUploadResponseDto> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await api.post<ApiResponse<BiometricUploadResponseDto>>(
    "/api/v1/attendance/biometric/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )
  return response.data.data!
}

export async function getDailyAttendances(
  params?: DailyAttendanceFilterParams
): Promise<PagedResponse<DailyAttendanceDto>> {
  const response = await api.get<ApiResponse<PagedResponse<DailyAttendanceDto>>>(
    "/api/v1/attendance/biometric/daily",
    { params }
  )
  return response.data.data ?? { items: [], totalCount: 0, page: 1, pageSize: 50 }
}

export async function getAttendanceExceptions(
  monthYear: string,
  departmentId?: string
): Promise<AttendanceExceptionDto[]> {
  const response = await api.get<ApiResponse<AttendanceExceptionDto[]>>(
    "/api/v1/attendance/biometric/exceptions",
    { params: { monthYear, departmentId } }
  )
  return response.data.data ?? []
}

export async function resolveAttendanceException(
  id: string,
  request: ResolveAttendanceExceptionRequest
): Promise<DailyAttendanceDto> {
  const response = await api.post<ApiResponse<DailyAttendanceDto>>(
    `/api/v1/attendance/biometric/exceptions/${id}/resolve`,
    request
  )
  return response.data.data!
}

export async function syncDailyToMonthlySummary(monthYear: string): Promise<number> {
  const response = await api.post<ApiResponse<number>>(
    "/api/v1/attendance/biometric/sync-summary",
    null,
    { params: { monthYear } }
  )
  return response.data.data ?? 0
}

export async function recalculateAttendance(
  monthYear: string,
  employeeId?: string
): Promise<number> {
  const response = await api.post<ApiResponse<number>>(
    "/api/v1/attendance/biometric/recalculate",
    null,
    { params: { monthYear, employeeId } }
  )
  return response.data.data ?? 0
}

export async function getBulkResolvePreview(
  monthYear: string,
  departmentId?: string,
  employeeId?: string
): Promise<BulkResolvePreviewItem[]> {
  const response = await api.get<ApiResponse<BulkResolvePreviewItem[]>>(
    "/api/v1/attendance/biometric/exceptions/bulk-preview",
    { params: { monthYear, departmentId, employeeId } }
  )
  return response.data.data ?? []
}

export async function bulkResolveExceptions(
  request: BulkResolveExceptionsRequest
): Promise<number> {
  const response = await api.post<ApiResponse<number>>(
    "/api/v1/attendance/biometric/exceptions/bulk-resolve",
    request
  )
  return response.data.data ?? 0
}

