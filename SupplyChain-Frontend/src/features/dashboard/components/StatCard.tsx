import { type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: number
}

export function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        {trend !== undefined && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              trend >= 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
      </div>
    </div>
  )
}
