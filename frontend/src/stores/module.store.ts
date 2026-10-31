import { create } from "zustand"
import api from "@/api/axios"

export interface ActiveModules {
  payroll: boolean
  definitions: boolean
  inventory: boolean
  salesOrders: boolean
  purchases: boolean
  auditLogs: boolean
  administration: boolean
}

interface ModuleState {
  modules: ActiveModules
  isLoaded: boolean
  fetchModules: () => Promise<void>
  isModuleEnabled: (name: keyof ActiveModules) => boolean
}

export const useModuleStore = create<ModuleState>((set, get) => ({
  modules: {
    payroll: true,
    definitions: true,
    inventory: false,
    salesOrders: false,
    purchases: false,
    auditLogs: true,
    administration: true,
  },
  isLoaded: false,
  fetchModules: async () => {
    try {
      const res = await api.get<{ success: boolean; data: ActiveModules }>("/api/v1/system/modules")
      if (res.data?.success && res.data?.data) {
        set({ modules: res.data.data, isLoaded: true })
      }
    } catch {
      set({ isLoaded: true })
    }
  },
  isModuleEnabled: (name) => {
    const mods = get().modules
    // Case-insensitive lookup
    const key = Object.keys(mods).find(
      (k) => k.toLowerCase() === name.toLowerCase()
    ) as keyof ActiveModules | undefined
    return key ? mods[key] : false
  },
}))

