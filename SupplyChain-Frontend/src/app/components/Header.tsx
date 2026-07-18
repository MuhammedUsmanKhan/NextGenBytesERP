import { Search, Bell, User } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Header() {
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

        <div className="flex items-center gap-2 border-l border-zinc-200 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-slate-600">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden text-sm md:block">
            <p className="font-medium leading-tight text-slate-900">Admin User</p>
            <p className="text-xs text-zinc-500">admin@nexuserp.com</p>
          </div>
        </div>
      </div>
    </header>
  )
}
