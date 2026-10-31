import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
} from "@/api/shift.api"
import type {
  CreateShiftDefinitionRequest,
  UpdateShiftDefinitionRequest,
} from "@/types/biometric-attendance.types"

const SHIFTS_KEY = "shifts"

export function useShifts() {
  return useQuery({
    queryKey: [SHIFTS_KEY],
    queryFn: () => getShifts(),
  })
}

export function useShift(id: string | null) {
  return useQuery({
    queryKey: [SHIFTS_KEY, id],
    queryFn: () => getShiftById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateShiftDefinitionRequest) => createShift(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [SHIFTS_KEY] })
      toast.success(`Shift '${res.name}' created successfully`)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to create shift"
      toast.error(msg)
    },
  })
}

export function useUpdateShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShiftDefinitionRequest }) =>
      updateShift(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [SHIFTS_KEY] })
      toast.success(`Shift '${res.name}' updated successfully`)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to update shift"
      toast.error(msg)
    },
  })
}

export function useDeleteShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIFTS_KEY] })
      toast.success("Shift deleted successfully")
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to delete shift"
      toast.error(msg)
    },
  })
}

