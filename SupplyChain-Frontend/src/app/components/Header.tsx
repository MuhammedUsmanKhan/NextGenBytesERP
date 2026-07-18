import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Bell, User, LogOut, LogIn } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/stores/auth.store"
import { logout, logoutAll } from "@/api/auth.api"
import { toast } from "sonner"

export function Header() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const logoutStore = useAuthStore((s) => s.logout)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // proceed with local logout even if API call fails
    }
    logoutStore()
    toast.success("Logged out successfully")
    navigate("/login", { replace: true })
  }

  async function handleLogoutAll() {
    try {
      await logoutAll()
    } catch {
      // proceed with local logout
    }
    logoutStore()
    toast.success("Logged out of all sessions")
    navigate("/login", { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/95 backdrop-blur-sm px-4 md:px-6">
      <div className="relative hidden w-full max-w-sm md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input placeholder="Search anything..." className="pl-10" />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-slate-700 transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 border-l border-zinc-200 pl-3 cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-slate-600">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden text-sm md:block text-left">
              <p className="font-medium leading-tight text-slate-900">
                {currentUser?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-zinc-500">{currentUser?.email || ""}</p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-zinc-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
              <button
                type="button"
                onClick={handleLogoutAll}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-zinc-50"
              >
                <LogIn className="h-4 w-4" />
                Logout All Sessions
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
