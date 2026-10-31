import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getMonthAttendance, upsertAttendance, bulkUpsertAttendance } from "@/api/attendance.api"
import type {
  UpsertAttendanceRequest,
  BulkUpsertAttendanceRequest,
  AttendanceFilterParams,
} from "@/types/attendance.types"

const QUERY_KEY = "attendance"

export function useMonthAttendance(params: AttendanceFilterParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getMonthAttendance(params),
    enabled: Boolean(params.monthYear),
  })
}

export function useUpsertAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpsertAttendanceRequest) => upsertAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success("Attendance saved successfully")
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to save attendance"
      toast.error(msg)
    },
  })
}

export function useBulkUpsertAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BulkUpsertAttendanceRequest) => bulkUpsertAttendance(data),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(`${count} attendance records saved successfully`)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to save attendance"
      toast.error(msg)
    },
  })
}

