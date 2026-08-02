import { BarChart3 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartSkeletonProps {
  title: string
}

const barHeights = [45, 65, 40, 80, 55, 90, 60, 75, 50, 85, 70, 95]

export function ChartSkeleton({ title }: ChartSkeletonProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      <div className="flex items-end justify-between gap-2 h-40">
        {barHeights.map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-zinc-400">
        <BarChart3 className="h-4 w-4" />
        <span className="text-xs">Chart data will load from API</span>
      </div>
    </div>
  )
}
