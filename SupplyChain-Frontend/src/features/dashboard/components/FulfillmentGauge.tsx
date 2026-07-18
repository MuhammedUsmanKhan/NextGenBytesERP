export function FulfillmentGauge() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-base font-bold text-slate-800">Order Fulfillment Rate</h3>
        <p className="mt-1 text-xs text-slate-400">
          Percentage of orders processed and shipped without delay.
        </p>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="40"
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r="40"
              fill="transparent"
              stroke="#2563eb"
              strokeWidth="8"
              strokeDasharray="251.2"
              strokeDashoffset="12.56"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-extrabold text-slate-900 font-display">95%</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Optimized
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-slate-50 pt-4 text-center">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">On-Time</p>
          <p className="mt-0.5 text-sm font-bold text-emerald-600">97.2%</p>
        </div>
        <div className="border-x border-slate-100">
          <p className="text-[10px] font-bold uppercase text-slate-400">Backorder</p>
          <p className="mt-0.5 text-sm font-bold text-amber-500">1.8%</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Damaged</p>
          <p className="mt-0.5 text-sm font-bold text-rose-500">0.4%</p>
        </div>
      </div>
    </div>
  )
}
