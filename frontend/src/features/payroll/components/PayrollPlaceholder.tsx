import { Banknote } from "lucide-react"

export default function PayrollPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center bg-white rounded-xl border border-slate-100 shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-sm">
        <Banknote className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 font-display mb-2">{title}</h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        Payroll Engine Module Active
      </div>
    </div>
  )
}

