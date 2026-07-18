import { PlusCircle, Truck, FileText, PackageSearch, TrendingUp } from "lucide-react"

const actions = [
  { label: "New Order", icon: PlusCircle, description: "Create a sales order", color: "text-blue-600", hoverColor: "hover:bg-blue-600" },
  { label: "Add Supplier", icon: Truck, description: "Register new vendor", color: "text-indigo-600", hoverColor: "hover:bg-indigo-600" },
  { label: "Create Report", icon: FileText, description: "Generate analytics pdf", color: "text-sky-600", hoverColor: "hover:bg-sky-600" },
  { label: "Manage Stock", icon: PackageSearch, description: "Update inventory count", color: "text-amber-600", hoverColor: "hover:bg-amber-600" },
]

export function QuickActions() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-base font-bold text-slate-800">Quick Actions</h3>
        <p className="mt-1 text-xs text-slate-400">Common administrative tasks and wizards.</p>
      </div>

      <div className="my-6 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="group flex h-28 flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-left transition-all hover:border-blue-200 hover:bg-blue-50"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-white shadow-sm transition-colors ${action.color} group-hover:text-white group-hover:${action.hoverColor}`}>
              <action.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-900">{action.label}</p>
              <p className="mt-0.5 text-[10px] text-slate-400 line-clamp-1">{action.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-emerald-500">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Target Status</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-700">85% of monthly sales goals met</p>
        </div>
      </div>
    </div>
  )
}
