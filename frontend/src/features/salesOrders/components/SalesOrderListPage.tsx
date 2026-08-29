import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Eye, Edit2, Trash2, Loader2 } from "lucide-react"
import { useGetSalesOrders, useDeleteSalesOrder, useCloseSalesOrder } from "@/hooks"
import type { SalesOrderListDto } from "@/types/sales-order.types"

const PAGE_SIZE = 20

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "Open", label: "Open" },
  { value: "Closed", label: "Closed" },
]

export default function SalesOrderListPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const { data: pagedData, isLoading } = useGetSalesOrders({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  })

  const deleteMutation = useDeleteSalesOrder()
  const closeMutation = useCloseSalesOrder()

  const items = pagedData?.items ?? []
  const totalCount = pagedData?.totalCount ?? 0
  const totalPages = pagedData?.totalPages ?? 0
  const currentPage = pagedData?.page ?? 1

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span><span>/</span><span className="text-slate-800">Sales Orders</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Sales Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your sales orders.</p>
        </div>
        <button onClick={() => navigate("/sales/sales-orders/new")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 cursor-pointer">
          <Plus className="w-4 h-4" /> Create Sales Order
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-60">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></span>
              <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }} placeholder="Search by SO number..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
              {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">SO Number</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Order Date</th>
                  <th className="px-6 py-4">Warehouse</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-right">Grand Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      {debouncedSearch || statusFilter ? "No sales orders match your filters." : "No sales orders found."}
                    </td>
                  </tr>
                ) : (
                  items.map((item: SalesOrderListDto) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4.5 font-mono text-xs text-blue-600 font-bold">{item.salesOrderNumber}</td>
                      <td className="px-6 py-4.5 font-bold text-slate-900">{item.customerName}</td>
                      <td className="px-6 py-4.5 text-slate-500">{formatDate(item.orderDate)}</td>
                      <td className="px-6 py-4.5 text-slate-500">{item.warehouseName ?? "—"}</td>
                      <td className="px-6 py-4.5 text-slate-500">{item.departmentName ?? "—"}</td>
                      <td className="px-6 py-4.5 text-right font-mono text-slate-700">{formatCurrency(item.grandTotal)}</td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${item.status === "Open" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-100 text-slate-600 border-slate-200"}`}>{item.status}</span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center justify-end gap-2.5">
                          <button onClick={() => navigate(`/sales/sales-orders/${item.id}`)} className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer" title="View"><Eye className="w-3.5 h-3.5" /></button>
                          {item.status === "Open" && (
                            <>
                              <button onClick={() => navigate(`/sales/sales-orders/${item.id}/edit`)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => { if (confirm(`Close sales order "${item.salesOrderNumber}"?`)) closeMutation.mutate(item.id) }} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors cursor-pointer" title="Close Order">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              </button>
                              <button onClick={() => { if (confirm(`Delete sales order "${item.salesOrderNumber}"?`)) deleteMutation.mutate(item.id) }} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Showing {items.length} of {totalCount} records</span>
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
