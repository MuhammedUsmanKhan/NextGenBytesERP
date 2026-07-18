import { useState } from "react"
import { Outlet } from "react-router-dom"
import { SidebarContext } from "@/hooks/useSidebar"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { Breadcrumbs } from "./Breadcrumbs"

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="flex h-screen overflow-hidden bg-zinc-50 text-slate-900">
        <Sidebar />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <Breadcrumbs />
              <div className="mt-4 animate-fade-in">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
