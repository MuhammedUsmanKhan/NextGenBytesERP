export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  expiresAt: string
}

export interface User {
  id: string
  email: string
  roles: string[]
  permissions: string[]
}
