import { Loader2, ToggleRight, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

export interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DefinitionTableProps<T> {
  columns: Column<T>[]
  items: T[]
  isLoading: boolean
  totalCount: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onToggleStatus?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  isStatusPending?: boolean
}

export function DefinitionTable<T extends { id: string }>({
  columns,
  items,
  isLoading,
  totalCount,
  page,
  totalPages,
  onPageChange,
  onToggleStatus,
  onEdit,
  onDelete,
  isStatusPending,
}: DefinitionTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4">{col.header}</th>
            ))}
            {(onToggleStatus || onEdit || onDelete) && (
              <th className="px-6 py-4 text-right">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-sm text-slate-700 font-medium">
          {items.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-400 text-xs">
                No records found.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4.5">
                    {col.render(item)}
                  </td>
                ))}
                {(onToggleStatus || onEdit || onDelete) && (
                  <td className="px-6 py-4.5">
                    <div className="flex items-center justify-end gap-2">
                      {onToggleStatus && (
                        <button
                          onClick={() => onToggleStatus(item)}
                          disabled={isStatusPending}
                          className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Toggle status"
                        >
                          <ToggleRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
        <span>Showing {items.length} of {totalCount} records</span>
        <div className="flex items-center gap-3">
          {totalPages > 0 && (
            <span className="text-slate-400">
              Page {page} of {totalPages}
            </span>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-slate-300">...</span>}
                  <button
                    onClick={() => onPageChange(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      p === page
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
