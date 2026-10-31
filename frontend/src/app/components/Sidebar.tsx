import { useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/hooks/useSidebar"
import { useModuleStore, type ActiveModules } from "@/stores/module.store"
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
  Package,
  Warehouse,
  ClipboardList,
  Layers,
  ArrowLeftRight,
  History,
  ChevronDown,
  Banknote,
  CalendarCheck,
  CreditCard,
  Calculator,
} from "lucide-react"

interface NavItem {
  name: string
  icon: React.ComponentType<{ className?: string }>
  path?: string
  module?: keyof ActiveModules
  children?: {
    name: string
    path: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

const navigation: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  {
    name: "Payroll",
    icon: Banknote,
    module: "payroll",
    children: [
      { name: "Employees", icon: Users, path: "/payroll/employees" },
      { name: "Attendance", icon: CalendarCheck, path: "/payroll/attendance" },
      { name: "Advances & Loans", icon: CreditCard, path: "/payroll/loans" },
      { name: "Payroll Runs", icon: Calculator, path: "/payroll/runs" },
      { name: "Reports & Denominations", icon: BarChart3, path: "/payroll/reports" },
    ],
  },
  {
    name: "Sales",
    icon: ShoppingBag,
    module: "salesOrders",
    children: [
      { name: "Sales Orders", icon: ShoppingBag, path: "/sales" },
    ],
  },
  { name: "Purchases", icon: Briefcase, path: "/purchases", module: "purchases" },
  { name: "Definitions", icon: Sliders, path: "/definitions", module: "definitions" },
  { name: "Products", icon: Package, path: "/products", module: "inventory" },
  {
    name: "Inventory",
    icon: Warehouse,
    module: "inventory",
    children: [
      { name: "Opening Stock", icon: ClipboardList, path: "/inventory/opening-stock" },
      { name: "Stock Summary", icon: Layers, path: "/inventory/stock" },
      { name: "Transactions", icon: ArrowLeftRight, path: "/inventory/transactions" },
    ],
  },
  { name: "Reports", icon: BarChart3, path: "/reports" },
  {
    name: "Administration",
    icon: Shield,
    module: "administration",
    children: [
      { name: "Users", icon: Users, path: "/users" },
      { name: "Roles", icon: Shield, path: "/roles" },
      { name: "Audit Logs", icon: History, path: "/audit-logs" },
    ],
  },
  { name: "Settings", icon: Settings, path: "/settings" },
]

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar()
  const { pathname } = useLocation()
  const { isModuleEnabled, fetchModules } = useModuleStore()

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const visibleNavigation = navigation.filter(
    (item) => !item.module || isModuleEnabled(item.module)
  )

  const defaultExpanded = visibleNavigation
    .filter((item) => item.children && item.children.length > 0)
    .filter((item) => item.children?.some((child) => pathname.startsWith(child.path)))
    .map((item) => item.name)

  const [expandedGroups, setExpandedGroups] = useState<string[]>(defaultExpanded)
  const [lastPath, setLastPath] = useState(pathname)

  if (pathname !== lastPath) {
    const names = visibleNavigation
      .filter((item) => item.children && item.children.length > 0)
      .filter((item) => item.children?.some((child) => pathname.startsWith(child.path)))
      .map((item) => item.name)
    setLastPath(pathname)
    setExpandedGroups((prev) => {
      const next = new Set([...prev, ...names])
      return Array.from(next)
    })
  }

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const isGroupActive = (children: readonly { path: string }[]) =>
    children.some((child) => pathname.startsWith(child.path))

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

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {visibleNavigation.map((item) => {
          if (!item.children || item.children.length === 0) {
            return (
              <NavLink
                key={item.name}
                to={item.path ?? "/"}
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
                        isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600",
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
            )
          }

          const active = item.children ? isGroupActive(item.children) : false
          const expanded = expandedGroups.includes(item.name)

          return (
            <div key={item.name}>
              <button
                type="button"
                onClick={() => toggleGroup(item.name)}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform",
                    active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600",
                    collapsed ? "mx-auto" : ""
                  )}
                />
                {!collapsed && (
                  <>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 text-left truncate"
                    >
                      {item.name}
                    </motion.span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-slate-400 transition-transform",
                        expanded && "rotate-180"
                      )}
                    />
                  </>
                )}
              </button>

              {expanded && !collapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-2 mt-1 space-y-1 border-l border-slate-100 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                            isActive
                              ? "bg-blue-50 text-blue-600"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )
                        }
                      >
                        {({ isActive }: { isActive: boolean }) => (
                          <>
                            {child.icon ? (
                              <child.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                            ) : (
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isActive ? "bg-blue-600" : "bg-slate-300")} />
                            )}
                            <span className="truncate">{child.name}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
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
