import { DollarSign, ShoppingBag, Truck, AlertTriangle } from "lucide-react"
import { StatCard } from "@/features/dashboard/components/StatCard"
import { ChartSkeleton } from "@/features/dashboard/components/ChartSkeleton"
import { QuickActions } from "@/features/dashboard/components/QuickActions"

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Welcome back, Admin. Here is your supply chain overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value="1,284"
          icon={ShoppingBag}
          trend={12.5}
        />
        <StatCard
          title="Revenue (MTD)"
          value="$248,500"
          icon={DollarSign}
          trend={8.2}
        />
        <StatCard
          title="Active Suppliers"
          value="48"
          icon={Truck}
          trend={-2.1}
        />
        <StatCard
          title="Low Stock Items"
          value="12"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton title="Monthly Revenue Trend" />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton title="Top Selling Categories" />
        <ChartSkeleton title="Order Fulfillment Rate" />
      </div>
    </div>
  )
}
