import { type LucideIcon } from "lucide-react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: number
}

export function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-1 text-xs font-semibold ${
              trend >= 0
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-rose-100 bg-rose-50 text-rose-700"
            }`}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 font-display">{value}</h3>
      </div>
    </div>
  )
}
