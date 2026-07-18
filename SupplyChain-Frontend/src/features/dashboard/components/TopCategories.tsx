export function TopCategories() {
  const categories = [
    { label: "Electronics & Smart Appliances", percentage: 48, value: "$119,280", color: "bg-blue-600" },
    { label: "Furniture & Living Solutions", percentage: 32, value: "$79,520", color: "bg-indigo-600" },
    { label: "Office Supplies & Tech Gear", percentage: 15, value: "$37,275", color: "bg-sky-500" },
    { label: "Industrial Equipment & Machinery", percentage: 5, value: "$12,425", color: "bg-slate-600" },
  ]

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-800">Top Selling Categories</h3>
      <p className="mt-1 text-xs text-slate-400">Highest sales contributors during the active cycle.</p>

      <div className="mt-6 space-y-4">
        {categories.map((cat) => (
          <div key={cat.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>{cat.label}</span>
              <span>{cat.percentage}% ({cat.value})</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${cat.color}`}
                style={{ width: `${cat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
