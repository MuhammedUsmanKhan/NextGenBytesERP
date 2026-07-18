import { useLocation, Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  sales: "Sales",
  purchases: "Purchases",
  definitions: "Definitions & Setup",
  reports: "Reports",
  settings: "Settings",
  users: "Users & Roles",
  roles: "Roles",
}

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500">
      <Link to="/" className="flex items-center hover:text-blue-600 transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const label = routeLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
        const isLast = index === segments.length - 1
        return (
          <span key={segment} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            {isLast ? (
              <span className="font-medium text-slate-700">{label}</span>
            ) : (
              <Link to={href} className="hover:text-blue-600 transition-colors">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
