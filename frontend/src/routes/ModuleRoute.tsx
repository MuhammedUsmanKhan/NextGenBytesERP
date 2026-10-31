import { Navigate, Outlet } from "react-router-dom"
import { useModuleStore, type ActiveModules } from "@/stores/module.store"

export function ModuleRoute({ module }: { module: keyof ActiveModules }) {
  const isEnabled = useModuleStore((s) => s.isModuleEnabled(module))
  if (!isEnabled) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

