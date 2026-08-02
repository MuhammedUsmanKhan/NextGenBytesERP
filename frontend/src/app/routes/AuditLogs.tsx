import { useState, useEffect } from "react"
import { Search, Eye, Loader2 } from "lucide-react"
import { useGetAuditLogs } from "@/hooks"
import { AuditLogDetailDialog } from "@/features/auditLogs/components/AuditLogDetailDialog"
import type { AuditLogDto } from "@/types/audit-log.types"

const PAGE_SIZE = 20

const MODULE_OPTIONS = [
  { value: "", label: "All Modules" },
  { value: "Product", label: "Product" },
  { value: "Inventory", label: "Inventory" },
  { value: "User", label: "User" },
  { value: "Role", label: "Role" },
  { value: "Definition", label: "Definition" },
  { value: "Auth", label: "Authentication" },
]

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "Create", label: "Create" },
  { value: "Update", label: "Update" },
  { value: "Delete", label: "Delete" },
  { value: "Login", label: "Login" },
  { value: "Logout", label: "Logout" },
]

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [moduleFilter, setModuleFilter] = useState("")
  const [actionFilter, setActionFilter] = useState("")
  const [page, setPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, moduleFilter, actionFilter])

  const { data: pagedData, isLoading } = useGetAuditLogs({
    page,
    pageSize: PAGE_SIZE,
    entity: moduleFilter || undefined,
    dateFrom: undefined,
    dateTo: undefined,
  })

  const items = pagedData?.items ?? []
  const totalCount = pagedData?.totalCount ?? 0
  const totalPages = pagedData?.totalPages ?? 0
  const currentPage = pagedData?.page ?? 1

  const filteredItems = items.filter((item: AuditLogDto) => {
    if (actionFilter && item.action !== actionFilter) return false
    if (!debouncedSearch) return true
    const q = debouncedSearch.toLowerCase()
    return item.entity?.toLowerCase().includes(q) ||
      item.action?.toLowerCase().includes(q) ||
      item.userId?.toLowerCase().includes(q) ||
      item.entityId?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span><span>/</span><span>Administration</span><span>/</span><span className="text-slate-800">Audit Logs</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">System activity log — read-only.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center gap-3 flex-wrap">
          <div className="relative w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user, entity, action..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
            {MODULE_OPTIONS.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
          </select>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
            {ACTION_OPTIONS.map((a) => (<option key={a.value} value={a.value}>{a.label}</option>))}
          </select>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Record ID</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      {debouncedSearch || moduleFilter || actionFilter
                        ? "No audit logs match your filters."
                        : "No audit logs found."}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item: AuditLogDto) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4.5 text-slate-500">{new Date(item.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4.5 font-mono text-[11px] text-slate-600">{item.userId}</td>
                      <td className="px-6 py-4.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          {item.entity}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          item.action === "Create" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          item.action === "Update" ? "bg-blue-50 text-blue-700 border-blue-100" :
                          item.action === "Delete" ? "bg-rose-50 text-rose-700 border-rose-100" :
                          "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {item.action}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 font-mono text-[11px] text-slate-500">{item.entityId}</td>
                      <td className="px-6 py-4.5 text-slate-500">{item.ipAddress ?? "—"}</td>
                      <td className="px-6 py-4.5 text-right">
                        <button
                          onClick={() => setSelectedLog(item)}
                          className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
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

      <AuditLogDetailDialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  )
}
