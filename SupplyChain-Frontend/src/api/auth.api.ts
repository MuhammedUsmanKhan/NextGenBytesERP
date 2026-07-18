import api from "./axios"
import type { ApiResponse, LoginRequest, LoginResponse } from "@/types"

export async function login(data: LoginRequest) {
  const response = await api.post<ApiResponse<LoginResponse>>("/api/v1/auth/login", data)
  return response.data.data
}

export async function refresh() {
  const response = await api.post<ApiResponse<LoginResponse>>("/api/v1/auth/refresh", {})
  return response.data.data
}

export async function logout() {
  await api.post("/api/v1/auth/logout")
}

export async function logoutAll() {
  await api.post("/api/v1/auth/logout-all")
}
