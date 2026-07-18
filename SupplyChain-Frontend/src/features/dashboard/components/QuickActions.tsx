import { PlusCircle, Truck, FileText, PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"

const actions = [
  { label: "New Order", icon: PlusCircle, description: "Create a purchase order" },
  { label: "Add Supplier", icon: Truck, description: "Register a new supplier" },
  { label: "Create Report", icon: FileText, description: "Generate analytics report" },
  { label: "Manage Stock", icon: PackageSearch, description: "Update inventory levels" },
]

export function QuickActions() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-4 text-center"
          >
            <action.icon className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-slate-700">{action.label}</p>
              <p className="text-xs font-normal text-zinc-500">{action.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
