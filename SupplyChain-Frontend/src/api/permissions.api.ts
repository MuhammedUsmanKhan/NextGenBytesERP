import api from "./axios"
import type { ApiResponse, PermissionDto } from "@/types"

export async function getPermissions() {
  const response = await api.get<ApiResponse<PermissionDto[]>>("/api/v1/permissions")
  return response.data.data
}
