import { create } from "zustand"
import { jwtDecode } from "jwt-decode"
import type { User } from "@/types"

interface JwtClaims {
  sub: string
  email: string
  role?: string | string[]
  permission?: string | string[]
}

interface AuthState {
  currentUser: User | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (accessToken: string) => void
  logout: () => void
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  clearAuth: () => void
}

function decodeUser(token: string): User {
  const claims = jwtDecode<JwtClaims>(token)
  const roles = claims.role
    ? Array.isArray(claims.role)
      ? claims.role
      : [claims.role]
    : []
  const permissions = claims.permission
    ? Array.isArray(claims.permission)
      ? claims.permission
      : [claims.permission]
    : []

  return {
    id: claims.sub,
    email: claims.email,
    roles,
    permissions,
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  accessToken: null,
  isAuthenticated: false,

  login: (accessToken: string) => {
    const user = decodeUser(accessToken)
    set({
      currentUser: user,
      accessToken,
      isAuthenticated: true,
    })
  },

  logout: () => {
    set({
      currentUser: null,
      accessToken: null,
      isAuthenticated: false,
    })
  },

  setUser: (user) => set({ currentUser: user }),

  setAccessToken: (token) => {
    if (token) {
      const user = decodeUser(token)
      set({ accessToken: token, currentUser: user, isAuthenticated: true })
    } else {
      set({ accessToken: null, isAuthenticated: false })
    }
  },

  clearAuth: () => {
    set({
      currentUser: null,
      accessToken: null,
      isAuthenticated: false,
    })
  },
}))
