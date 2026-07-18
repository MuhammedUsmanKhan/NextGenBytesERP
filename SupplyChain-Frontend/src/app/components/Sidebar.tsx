import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/hooks/useSidebar"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  BarChart3,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Sales", icon: ShoppingCart, path: "/sales" },
  { name: "Purchases", icon: Package, path: "/purchases" },
  { name: "Definitions", icon: FolderTree, path: "/definitions" },
  { name: "Users & Roles", icon: Users, path: "/users" },
  { name: "Roles", icon: Shield, path: "/roles" },
  { name: "Reports", icon: BarChart3, path: "/reports" },
  { name: "Settings", icon: Settings, path: "/settings" },
]

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-zinc-200 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b border-zinc-100 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <span className="text-sm font-bold text-white">E</span>
        </div>
        {!collapsed && (
          <span className="ml-3 truncate text-lg font-semibold tracking-tight text-slate-900">
            NexusERP
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-zinc-100 hover:text-slate-900",
                collapsed && "justify-center px-2"
              )
            }
          >
            <item.icon
              className={cn(
                "h-5 w-5 shrink-0",
                collapsed ? "mx-auto" : "mr-3"
              )}
            />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-zinc-100 px-2 py-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-zinc-100 hover:text-slate-700 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
