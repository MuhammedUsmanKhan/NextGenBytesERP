import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ShoppingBag,
  DollarSign,
  Truck,
  AlertTriangle,
  PlusCircle,
  UserPlus,
  FileText,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  TrendingUp,
} from "lucide-react"
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
import { useNotificationStore } from "@/stores/notification.store"

const salesData = [
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

export default function Dashboard() {
  const navigate = useNavigate()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const [loading, setLoading] = useState(false)
  const [lowStockCount, setLowStockCount] = useState(12)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [data, setData] = useState(salesData)

  const simulateApiRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setData(
        data.map((d) => ({
          ...d,
          revenue: Math.floor(d.revenue * (0.9 + Math.random() * 0.2)),
        }))
      )
      setLoading(false)
      addNotification({
        text: "Dashboard analytics reloaded successfully from Live API.",
        read: false,
        type: "success",
      })
    }, 800)
  }

  const handleExportReport = () => {
    addNotification({
      text: "Monthly Revenue Report exported successfully.",
      read: false,
      type: "success",
    })
  }

  const handleQuickStockUpdate = () => {
    const change = prompt("Enter new count of low stock items:", String(lowStockCount))
    if (change !== null) {
      const num = parseInt(change, 10)
      if (!isNaN(num)) {
        setLowStockCount(num)
        addNotification({
          text: `Low stock items adjusted manually to ${num}.`,
          read: false,
          type: "warning",
        })
      }
    }
  }

  return (
    <div className="space-y-6 select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="text-slate-800">Home</span>
        <span>/</span>
        <span className="text-slate-800">Dashboard</span>
      </div>

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, Admin. Here is your supply chain overview.
          </p>
        </div>
        <button
          onClick={simulateApiRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh API Data"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              12.5%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 font-display">1,284</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              8.2%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue (MTD)</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 font-display">$248,500</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
              <Truck className="w-5 h-5" />
            </div>
            <span className="px-2 py-1 bg-rose-50 text-rose-700 font-semibold text-xs rounded-full flex items-center gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" />
              2.1%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Suppliers</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 font-display">48</p>
          </div>
        </div>

        <div
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
          onClick={handleQuickStockUpdate}
        >
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              lowStockCount > 15 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            {lowStockCount > 15 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full animate-pulse">
                CRITICAL
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Items</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 font-display">{lowStockCount}</p>
          </div>
          <span className="text-[10px] text-blue-600 font-medium hover:underline block mt-2">
            Click to adjust stock count
          </span>
        </div>
      </div>

      {/* Main Graph & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend Column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Monthly Revenue Trend</h3>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Live Server Feed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Overview of monthly revenue in USD currency.</p>
          </div>

          <div className="h-64 mt-6">
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
                  tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 text-white px-3 py-2 rounded-lg text-xs font-mono shadow-md border border-slate-800">
                          <p className="font-semibold">{payload[0].payload.month}</p>
                          <p className="text-emerald-400 mt-0.5">
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

          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f1f5f9] inline-block"></span> Standard Month
              <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0] inline-block ml-2"></span> Outlier Revenue (July)
            </span>
            <span className="font-medium italic">Chart data will load from API</span>
          </div>
        </div>

        {/* Quick Actions Column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Quick Actions</h3>
            <p className="text-xs text-slate-400 mt-1">Common administrative tasks and wizards.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 my-6">
            <button
              onClick={() => navigate("/sales")}
              className="p-4 bg-slate-50/70 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-xl text-left transition-all group flex flex-col justify-between h-28 cursor-pointer"
            >
              <div className="w-8 h-8 bg-white text-blue-600 rounded-lg flex items-center justify-center border border-slate-100 shadow-sm group-hover:text-white group-hover:bg-blue-600 transition-colors">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-900">New Order</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Create a sales order</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/purchases")}
              className="p-4 bg-slate-50/70 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-xl text-left transition-all group flex flex-col justify-between h-28 cursor-pointer"
            >
              <div className="w-8 h-8 bg-white text-indigo-600 rounded-lg flex items-center justify-center border border-slate-100 shadow-sm group-hover:text-white group-hover:bg-indigo-600 transition-colors">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">Add Supplier</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Register new vendor</p>
              </div>
            </button>

            <button
              onClick={handleExportReport}
              className="p-4 bg-slate-50/70 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-xl text-left transition-all group flex flex-col justify-between h-28 cursor-pointer"
            >
              <div className="w-8 h-8 bg-white text-sky-600 rounded-lg flex items-center justify-center border border-slate-100 shadow-sm group-hover:text-white group-hover:bg-sky-600 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-sky-900">Create Report</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Generate analytics pdf</p>
              </div>
            </button>

            <button
              onClick={handleQuickStockUpdate}
              className="p-4 bg-slate-50/70 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-xl text-left transition-all group flex flex-col justify-between h-28 cursor-pointer"
            >
              <div className="w-8 h-8 bg-white text-amber-600 rounded-lg flex items-center justify-center border border-slate-100 shadow-sm group-hover:text-white group-hover:bg-amber-600 transition-colors">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-amber-900">Manage Stock</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Update inventory count</p>
              </div>
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Status</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">85% of monthly sales goals met</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories & Fulfillment Rate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Selling Categories */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Top Selling Categories</h3>
          <p className="text-xs text-slate-400 mt-1">Highest sales contributors during the active cycle.</p>

          <div className="space-y-4 mt-6">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Electronics & Smart Appliances</span>
                <span>48% ($119,280)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "48%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Furniture & Living Solutions</span>
                <span>32% ($79,520)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: "32%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Office Supplies & Tech Gear</span>
                <span>15% ($37,275)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: "15%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Industrial Equipment & Machinery</span>
                <span>5% ($12,425)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full" style={{ width: "5%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Fulfillment Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Order Fulfillment Rate</h3>
            <p className="text-xs text-slate-400 mt-1">Percentage of orders processed and shipped without delay.</p>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent" stroke="#2563eb" strokeWidth="8"
                  strokeDasharray="251.2" strokeDashoffset="12.56"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-extrabold text-slate-900 font-display">95%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Optimized</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-50 pt-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">On-Time</p>
              <p className="text-sm font-bold text-emerald-600 mt-0.5">97.2%</p>
            </div>
            <div className="border-x border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Backorder</p>
              <p className="text-sm font-bold text-amber-500 mt-0.5">1.8%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Damaged</p>
              <p className="text-sm font-bold text-red-500 mt-0.5">0.4%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
