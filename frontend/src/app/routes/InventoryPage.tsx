import { useState, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import { useGetInventoryList } from "@/hooks"
import { useDefinitionList } from "@/hooks"

const PAGE_SIZE = 20

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [warehouseFilter, setWarehouseFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, warehouseFilter, statusFilter])

  const { data: pagedData, isLoading } = useGetInventoryList({
    page,
    pageSize: PAGE_SIZE,
    warehouseId: warehouseFilter || undefined,
  })
  const { data: warehousesData } = useDefinitionList("warehouses", { pageSize: 100 })

  const items = pagedData?.items ?? []
  const totalCount = pagedData?.totalCount ?? 0
  const totalPages = pagedData?.totalPages ?? 0
  const currentPage = pagedData?.page ?? 1

  const warehouseOptions = (warehousesData?.items ?? []).map((w: any) => ({ id: w.id, code: w.code, name: w.name }))

  const getStockStatus = (item: any) => {
    if (item.availableQuantity <= 0) return { label: "Out of Stock", class: "bg-rose-50 text-rose-700 border-rose-100" }
    if (item.reorderLevel != null && item.availableQuantity <= item.reorderLevel) return { label: "Low Stock", class: "bg-amber-50 text-amber-700 border-amber-100" }
    return { label: "In Stock", class: "bg-emerald-50 text-emerald-700 border-emerald-100" }
  }

  const filteredItems = items.filter((item: any) => {
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      if (!item.productCode.toLowerCase().includes(q) && !item.productName.toLowerCase().includes(q)) return false
    }
    if (statusFilter === "out") return item.availableQuantity <= 0
    if (statusFilter === "low") return item.reorderLevel != null && item.availableQuantity <= item.reorderLevel
    if (statusFilter === "in") return item.availableQuantity > 0
    return true
  })

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span><span>/</span><span>Inventory</span><span>/</span><span className="text-slate-800">Stock Summary</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Inventory</h1>
        <p className="text-sm text-slate-500 mt-1">Current stock summary across warehouses.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center gap-3 flex-wrap">
          <div className="relative w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code or name..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
            <option value="">All Warehouses</option>
            {warehouseOptions.map((w: any) => (<option key={w.id} value={w.id}>{w.code} - {w.name}</option>))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
            <option value="">All Status</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Product Code</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Warehouse</th>
                  <th className="px-6 py-4">Qty On Hand</th>
                  <th className="px-6 py-4">Reserved</th>
                  <th className="px-6 py-4">Available</th>
                  <th className="px-6 py-4">Avg Cost</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      {debouncedSearch || warehouseFilter || statusFilter
                        ? "No inventory records match your filters."
                        : "No inventory records found."}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item: any) => {
                    const status = getStockStatus(item)
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4.5 font-mono text-xs text-slate-500">{item.productCode}</td>
                        <td className="px-6 py-4.5 font-bold text-slate-900">{item.productName}</td>
                        <td className="px-6 py-4.5 text-slate-500">{item.warehouseName}</td>
                        <td className="px-6 py-4.5 font-mono">{item.quantityOnHand}</td>
                        <td className="px-6 py-4.5 font-mono">{item.reservedQuantity}</td>
                        <td className="px-6 py-4.5 font-mono font-bold">{item.availableQuantity}</td>
                        <td className="px-6 py-4.5 font-mono">{Number(item.averageCost).toFixed(2)}</td>
                        <td className="px-6 py-4.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Showing {filteredItems.length} of {totalCount} records</span>
          <div className="flex items-center gap-3">
            {totalPages > 0 && <span>Page {currentPage} of {totalPages}</span>}
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="p-1.5 hover:bg-slate-200 rounded-lg disabled:opacity-30 cursor-pointer">Prev</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-1.5 hover:bg-slate-200 rounded-lg disabled:opacity-30 cursor-pointer">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
