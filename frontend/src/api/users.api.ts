import api from "./axios"
import type { ApiResponse, UserDto, AssignRolesRequest, RoleDto } from "@/types"

export async function getUsers() {
  const response = await api.get<ApiResponse<UserDto[]>>("/api/v1/users")
  return response.data.data
}

export async function getUserRoles(userId: string) {
  const response = await api.get<ApiResponse<RoleDto[]>>(`/api/v1/users/${userId}/roles`)
  return response.data.data
}

export async function assignRoles(userId: string, data: AssignRolesRequest) {
  await api.post(`/api/v1/users/${userId}/roles`, data)
}

export async function removeRole(userId: string, roleId: string) {
  await api.delete(`/api/v1/users/${userId}/roles/${roleId}`)
}
