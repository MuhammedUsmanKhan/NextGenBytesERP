import { NavLink } from "react-router-dom"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/hooks/useSidebar"
import {
  LayoutDashboard,
  ShoppingBag,
  Briefcase,
  Sliders,
  BarChart3,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Sales", icon: ShoppingBag, path: "/sales" },
  { name: "Purchases", icon: Briefcase, path: "/purchases" },
  { name: "Definitions", icon: Sliders, path: "/definitions" },
  { name: "Users & Roles", icon: Users, path: "/users" },
  { name: "Roles", icon: Shield, path: "/roles" },
  { name: "Reports", icon: BarChart3, path: "/reports" },
  { name: "Settings", icon: Settings, path: "/settings" },
]

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col border-r border-slate-100 bg-white flex-shrink-0 relative select-none"
    >
      <div className="flex h-16 items-center border-b border-slate-100 px-4 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-100">
            <span className="text-lg font-bold text-white font-display">E</span>
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="truncate text-lg font-bold text-slate-900 font-display tracking-tight"
            >
              NexusERP
            </motion.span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                collapsed && "justify-center px-2"
              )
            }
            title={collapsed ? item.name : undefined}
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform",
                    isActive
                      ? "text-blue-600"
                      : "text-slate-400 group-hover:text-slate-600",
                    collapsed ? "mx-auto" : ""
                  )}
                />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
