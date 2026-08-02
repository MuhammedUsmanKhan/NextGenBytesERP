import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Bell, Check, Trash, LogOut, LogIn, CheckSquare } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useNotificationStore } from "@/stores/notification.store"
import { logout, logoutAll } from "@/api/auth.api"
import { toast } from "sonner"

const demoUsers = [
  { name: "Admin", email: "admin@nexuserp.com", role: "Admin" },
  { name: "Sarah Connor", email: "editor@nexuserp.com", role: "Editor" },
  { name: "John Doe", email: "viewer@nexuserp.com", role: "Viewer" },
]

export function Header() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const logoutStore = useAuthStore((s) => s.logout)
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const notificationRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
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

  const initials = currentUser?.email
    ? currentUser.email.charAt(0).toUpperCase()
    : "U"

  const displayName = currentUser?.email?.split("@")[0] || "User"

  return (
    <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-slate-100 bg-white px-6 select-none">
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ERP (orders, categories, users...)"
          className="w-full rounded-lg border border-slate-200/80 bg-slate-50/70 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-800"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 divide-y divide-slate-50 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    No notifications to display.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 transition-colors hover:bg-slate-50/80 ${!n.read ? "bg-blue-50/20" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <p className={`text-xs leading-relaxed ${!n.read ? "font-medium text-slate-900" : "text-slate-700"}`}>
                            {n.text}
                          </p>
                          <span className="block text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {!n.read && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              className="rounded p-1 text-blue-600 transition-colors hover:bg-slate-100"
                              title="Mark read"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => removeNotification(n.id)}
                            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-500"
                            title="Remove"
                          >
                            <Trash className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700 shadow-sm">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-800">{displayName}</p>
              <p className="max-w-32 truncate text-[10px] font-medium text-slate-400">
                {currentUser?.email || ""}
              </p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 z-50 mt-2 w-56 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
              <div className="px-4 py-3">
                <p className="text-xs font-bold text-slate-800">Current Profile</p>
                <div className="mt-1 rounded-lg border border-blue-100/50 bg-blue-50/50 px-2.5 py-1.5">
                  <p className="text-xs font-semibold text-blue-800">{displayName}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-blue-600">{currentUser?.email || ""}</p>
                  <span className="mt-1 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700">
                    Admin
                  </span>
                </div>
              </div>

              <div className="py-1">
                <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active User
                </p>
                {demoUsers.map((usr) => (
                  <button
                    key={usr.email}
                    type="button"
                    onClick={() => {
                      toast.info(`Switched to ${usr.name} (simulated)`)
                      setShowProfile(false)
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2 text-xs transition-colors ${
                      displayName === usr.name
                        ? "bg-blue-50/40 font-semibold text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <div className="text-left">
                      <div>{usr.name}</div>
                      <div className="text-[9px] font-normal text-slate-400">{usr.email}</div>
                    </div>
                    <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-medium text-slate-600">
                      {usr.role}
                    </span>
                  </button>
                ))}
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
                <button
                  type="button"
                  onClick={handleLogoutAll}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <LogIn className="h-4 w-4" />
                  Logout All Sessions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
