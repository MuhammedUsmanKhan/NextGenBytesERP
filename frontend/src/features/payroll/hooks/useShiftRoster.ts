import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { shiftRosterApi } from "../api/shift-roster.api"
import type { BulkAssignRosterRequest } from "@/types/shift-roster.types"

export function useRosterCalendar(monthYear: string, departmentId?: string) {
  return useQuery({
    queryKey: ["shift-roster", monthYear, departmentId],
    queryFn: () => shiftRosterApi.getRosterCalendar(monthYear, departmentId),
    enabled: !!monthYear,
  })
}

export function useBulkAssignRoster(monthYear: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkAssignRosterRequest) => shiftRosterApi.bulkAssignRoster(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-roster", monthYear] })
      queryClient.invalidateQueries({ queryKey: ["biometric-daily"] })
      queryClient.invalidateQueries({ queryKey: ["attendance-exceptions"] })
    },
  })
}

export function useDeleteRosterAssignment(monthYear: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => shiftRosterApi.deleteRosterAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-roster", monthYear] })
      queryClient.invalidateQueries({ queryKey: ["biometric-daily"] })
    },
  })
}

