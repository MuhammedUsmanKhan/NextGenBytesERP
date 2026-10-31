import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  uploadBiometricDatFile,
  getDailyAttendances,
  getAttendanceExceptions,
  resolveAttendanceException,
  syncDailyToMonthlySummary,
  recalculateAttendance,
  getBulkResolvePreview,
  bulkResolveExceptions,
} from "@/api/biometric-attendance.api"
import type {
  DailyAttendanceFilterParams,
  ResolveAttendanceExceptionRequest,
  BulkResolveExceptionsRequest,
} from "@/types/biometric-attendance.types"

const DAILY_ATTENDANCE_KEY = "daily-attendance"
const ATTENDANCE_EXCEPTIONS_KEY = "attendance-exceptions"
const MONTH_ATTENDANCE_KEY = "month-attendance"
const BULK_RESOLVE_PREVIEW_KEY = "bulk-resolve-preview"

export function useDailyAttendance(params?: DailyAttendanceFilterParams) {
  return useQuery({
    queryKey: [DAILY_ATTENDANCE_KEY, params],
    queryFn: () => getDailyAttendances(params),
  })
}

export function useAttendanceExceptions(monthYear: string, departmentId?: string) {
  return useQuery({
    queryKey: [ATTENDANCE_EXCEPTIONS_KEY, monthYear, departmentId],
    queryFn: () => getAttendanceExceptions(monthYear, departmentId),
    enabled: Boolean(monthYear),
  })
}

export function useUploadBiometricDat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadBiometricDatFile(file),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [DAILY_ATTENDANCE_KEY] })
      queryClient.invalidateQueries({ queryKey: [ATTENDANCE_EXCEPTIONS_KEY] })
      queryClient.invalidateQueries({ queryKey: [MONTH_ATTENDANCE_KEY] })
      toast.success(
        `Biometric upload complete! ${res.validPunchesImported} punches recorded across ${res.dailyRecordsCreated} daily shifts.`
      )
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to process biometric file"
      toast.error(msg)
    },
  })
}

export function useResolveAttendanceException() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolveAttendanceExceptionRequest }) =>
      resolveAttendanceException(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DAILY_ATTENDANCE_KEY] })
      queryClient.invalidateQueries({ queryKey: [ATTENDANCE_EXCEPTIONS_KEY] })
      queryClient.invalidateQueries({ queryKey: [MONTH_ATTENDANCE_KEY] })
      toast.success("Attendance exception resolved successfully")
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to resolve exception"
      toast.error(msg)
    },
  })
}

export function useSyncBiometricSummary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (monthYear: string) => syncDailyToMonthlySummary(monthYear),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: [MONTH_ATTENDANCE_KEY] })
      queryClient.invalidateQueries({ queryKey: [DAILY_ATTENDANCE_KEY] })
      toast.success(`Synced monthly roster! ${count} employee records updated from biometric punches.`)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to sync attendance summary"
      toast.error(msg)
    },
  })
}

export function useRecalculateAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ monthYear, employeeId }: { monthYear: string; employeeId?: string }) =>
      recalculateAttendance(monthYear, employeeId),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: [MONTH_ATTENDANCE_KEY] })
      queryClient.invalidateQueries({ queryKey: [DAILY_ATTENDANCE_KEY] })
      queryClient.invalidateQueries({ queryKey: [ATTENDANCE_EXCEPTIONS_KEY] })
      toast.success(`Recalculation complete! ${count} daily records refreshed from rosters and punches.`)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to recalculate attendance"
      toast.error(msg)
    },
  })
}

export function useBulkResolvePreview(
  monthYear: string,
  departmentId?: string,
  employeeId?: string,
  enabled = true
) {
  return useQuery({
    queryKey: [BULK_RESOLVE_PREVIEW_KEY, monthYear, departmentId, employeeId],
    queryFn: () => getBulkResolvePreview(monthYear, departmentId, employeeId),
    enabled: enabled && !!monthYear,
  })
}

export function useBulkResolveExceptions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: BulkResolveExceptionsRequest) => bulkResolveExceptions(request),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: [DAILY_ATTENDANCE_KEY] })
      queryClient.invalidateQueries({ queryKey: [ATTENDANCE_EXCEPTIONS_KEY] })
      queryClient.invalidateQueries({ queryKey: [MONTH_ATTENDANCE_KEY] })
      queryClient.invalidateQueries({ queryKey: [BULK_RESOLVE_PREVIEW_KEY] })
      toast.success(`Successfully resolved ${count} attendance exceptions! Monthly roster updated.`)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to bulk resolve exceptions"
      toast.error(msg)
    },
  })
}
