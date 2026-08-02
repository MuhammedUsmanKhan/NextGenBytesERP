import api from "./axios"
import type { ApiResponse, RoleDto, CreateRoleRequest, AssignPermissionsRequest } from "@/types"

export async function getRoles() {
  const response = await api.get<ApiResponse<RoleDto[]>>("/api/v1/roles")
  return response.data.data
}

export async function createRole(data: CreateRoleRequest) {
  const response = await api.post<ApiResponse<RoleDto>>("/api/v1/roles", data)
  return response.data.data
}

export async function assignPermissions(roleId: string, data: AssignPermissionsRequest) {
  await api.post(`/api/v1/roles/${roleId}/permissions`, data)
}

export async function removePermission(roleId: string, permissionId: string) {
  await api.delete(`/api/v1/roles/${roleId}/permissions/${permissionId}`)
}
