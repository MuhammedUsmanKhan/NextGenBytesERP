import api from "@/api/axios"
import type { ApiResponse } from "@/types/api.types"
import type { ShiftRosterCalendarResponse, BulkAssignRosterRequest } from "@/types/shift-roster.types"

export const shiftRosterApi = {
  getRosterCalendar: async (monthYear: string, departmentId?: string) => {
    const res = await api.get<ApiResponse<ShiftRosterCalendarResponse>>("/api/v1/shifts/roster", {
      params: { monthYear, departmentId: departmentId || undefined },
    })
    return res.data.data
  },

  bulkAssignRoster: async (data: BulkAssignRosterRequest) => {
    const res = await api.post<ApiResponse<number>>("/api/v1/shifts/roster/bulk-assign", data)
    return res.data
  },

  deleteRosterAssignment: async (id: string) => {
    const res = await api.delete<ApiResponse<boolean>>(`/api/v1/shifts/roster/${id}`)
    return res.data
  },
}

