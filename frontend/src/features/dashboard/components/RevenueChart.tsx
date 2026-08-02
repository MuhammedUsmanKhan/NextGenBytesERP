import { useState } from "react"
import { RefreshCw } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const initialData = [
  { month: "Jan", revenue: 18500 },
  { month: "Feb", revenue: 22000 },
  { month: "Mar", revenue: 15400 },
  { month: "Apr", revenue: 24800 },
  { month: "May", revenue: 21000 },
  { month: "Jun", revenue: 29500 },
  { month: "Jul", revenue: 248500 },
  { month: "Aug", revenue: 31000 },
  { month: "Sep", revenue: 27000 },
  { month: "Oct", revenue: 34000 },
  { month: "Nov", revenue: 38000 },
  { month: "Dec", revenue: 42000 },
]

export function RevenueChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(initialData)

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setData(
        initialData.map((d) => ({
          ...d,
          revenue: Math.floor(d.revenue * (0.9 + Math.random() * 0.2)),
        }))
      )
      setLoading(false)
    }, 800)
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Monthly Revenue Trend</h3>
          <p className="mt-1 text-xs text-slate-400">Overview of monthly revenue in USD currency.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh API Data"}
        </button>
      </div>

      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
              tickFormatter={(val: number) => `$${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-white shadow-md">
                      <p className="font-semibold">{payload[0].payload.month}</p>
                      <p className="mt-0.5 text-emerald-400">
                        Revenue: ${payload[0].value?.toLocaleString()}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="revenue"
              radius={[6, 6, 0, 0]}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    activeIndex === index
                      ? "#2563eb"
                      : entry.revenue > 100000
                        ? "#e2e8f0"
                        : "#f1f5f9"
                  }
                  stroke={activeIndex === index ? "#1d4ed8" : "none"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f1f5f9]" /> Standard Month
          <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full bg-[#e2e8f0]" /> Outlier Revenue (July)
        </span>
        <span className="font-medium italic">Live Server Feed</span>
      </div>
    </div>
  )
}
