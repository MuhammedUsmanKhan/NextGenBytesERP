import { useState, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import { useGetTransactions } from "@/hooks"
import { useGetProducts } from "@/hooks"
import { useDefinitionList } from "@/hooks"
import type { ProductDto } from "@/types/product.types"
import type { WarehouseDto } from "@/types/definition.types"
import type { InventoryTransactionDto } from "@/types/inventory.types"

const PAGE_SIZE = 20

const TRANSACTION_TYPES = [
  { value: "", label: "All Types" },
  { value: "OpeningStock", label: "Opening Stock" },
  { value: "Purchase", label: "Purchase" },
  { value: "Sales", label: "Sales" },
  { value: "Adjustment", label: "Adjustment" },
  { value: "Transfer", label: "Transfer" },
]

export default function InventoryTransactions() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [productFilter, setProductFilter] = useState("")
  const [warehouseFilter, setWarehouseFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: pagedData, isLoading } = useGetTransactions({
    page,
    pageSize: PAGE_SIZE,
    productId: productFilter || undefined,
    warehouseId: warehouseFilter || undefined,
    type: typeFilter || undefined,
  })
  const { data: productsData } = useGetProducts({ pageSize: 100 })
  const { data: warehousesData } = useDefinitionList("warehouses", { pageSize: 100 })

  const items = pagedData?.items ?? []
  const totalCount = pagedData?.totalCount ?? 0
  const totalPages = pagedData?.totalPages ?? 0
  const currentPage = pagedData?.page ?? 1

  const productOptions = (productsData?.items ?? []).map((p: ProductDto) => ({ id: p.id, productCode: p.productCode, productName: p.productName }))
  const warehouseOptions = (warehousesData?.items ?? []).map((w: WarehouseDto) => ({ id: w.id, code: w.code, name: w.name }))

  const filteredItems = items.filter((item: InventoryTransactionDto) => {
    if (!debouncedSearch) return true
    const q = debouncedSearch.toLowerCase()
    return item.productCode?.toLowerCase().includes(q) ||
      item.productName?.toLowerCase().includes(q) ||
      item.warehouseName?.toLowerCase().includes(q) ||
      item.referenceType?.toLowerCase().includes(q) ||
      item.createdBy?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span><span>/</span><span>Inventory</span><span>/</span><span className="text-slate-800">Transactions</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Inventory Transactions</h1>
        <p className="text-sm text-slate-500 mt-1">Stock ledger — all inventory movements.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center gap-3 flex-wrap">
          <div className="relative w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <select value={productFilter} onChange={(e) => { setProductFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
            <option value="">All Products</option>
            {productOptions.map((p) => (<option key={p.id} value={p.id}>{p.productCode} - {p.productName}</option>))}
          </select>
          <select value={warehouseFilter} onChange={(e) => { setWarehouseFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
            <option value="">All Warehouses</option>
            {warehouseOptions.map((w) => (<option key={w.id} value={w.id}>{w.code} - {w.name}</option>))}
          </select>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
            {TRANSACTION_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
          </select>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Warehouse</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Unit Cost</th>
                  <th className="px-6 py-4">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      {debouncedSearch || productFilter || warehouseFilter || typeFilter
                        ? "No transactions match your filters."
                        : "No transactions found."}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item: InventoryTransactionDto) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4.5 text-slate-500">{new Date(item.transactionDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4.5">
                        <span className="font-mono text-xs text-slate-500">{item.productCode}</span>
                        <br />
                        <span className="text-slate-900 font-bold">{item.productName}</span>
                      </td>
                      <td className="px-6 py-4.5 text-slate-500">{item.warehouseName}</td>
                      <td className="px-6 py-4.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {item.transactionType}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-slate-500">
                        {item.referenceType ? `${item.referenceType} / ${item.referenceId?.slice(0, 8) ?? ""}` : "—"}
                      </td>
                      <td className="px-6 py-4.5 font-mono">{item.quantity}</td>
                      <td className="px-6 py-4.5 font-mono">{Number(item.unitCost).toFixed(2)}</td>
                      <td className="px-6 py-4.5 text-slate-500 font-mono text-[11px]">{item.createdBy}</td>
                    </tr>
                  ))
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
