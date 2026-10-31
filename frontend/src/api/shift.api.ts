import api from "./axios"
import type { ApiResponse } from "@/types"
import type {
  ShiftDefinitionDto,
  CreateShiftDefinitionRequest,
  UpdateShiftDefinitionRequest,
} from "@/types/biometric-attendance.types"

export async function getShifts(): Promise<ShiftDefinitionDto[]> {
  const response = await api.get<ApiResponse<ShiftDefinitionDto[]>>("/api/v1/shifts")
  return response.data.data ?? []
}

export async function getShiftById(id: string): Promise<ShiftDefinitionDto> {
  const response = await api.get<ApiResponse<ShiftDefinitionDto>>(`/api/v1/shifts/${id}`)
  return response.data.data!
}

export async function createShift(data: CreateShiftDefinitionRequest): Promise<ShiftDefinitionDto> {
  const response = await api.post<ApiResponse<ShiftDefinitionDto>>("/api/v1/shifts", data)
  return response.data.data!
}

export async function updateShift(id: string, data: UpdateShiftDefinitionRequest): Promise<ShiftDefinitionDto> {
  const response = await api.put<ApiResponse<ShiftDefinitionDto>>(`/api/v1/shifts/${id}`, data)
  return response.data.data!
}

export async function deleteShift(id: string): Promise<boolean> {
  const response = await api.delete<ApiResponse<boolean>>(`/api/v1/shifts/${id}`)
  return response.data.data ?? false
}

