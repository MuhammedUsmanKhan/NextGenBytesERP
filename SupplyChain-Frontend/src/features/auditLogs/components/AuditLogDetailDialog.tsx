import type { AuditLogDto } from "@/types/audit-log.types"

interface Props {
  open: boolean
  onClose: () => void
  log: AuditLogDto | null
}

export function AuditLogDetailDialog({ open, onClose, log }: Props) {
  if (!open || !log) return null

  const formatJson = (val: string | null) => {
    if (!val) return <span className="text-slate-400 italic">None</span>
    try {
      const parsed = JSON.parse(val)
      return (
        <pre className="text-xs font-mono text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto max-h-60 whitespace-pre-wrap">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )
    } catch {
      return <span className="text-xs font-mono text-slate-700">{val}</span>
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">Audit Log Detail</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold hover:bg-slate-100 p-1 rounded-lg text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Time</span>
              <span className="text-slate-700 font-semibold">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">User</span>
              <span className="text-slate-700 font-mono">{log.userId}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Module / Entity</span>
              <span className="text-slate-700 font-semibold">{log.entity}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Action</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                {log.action}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Record ID</span>
              <span className="text-slate-700 font-mono text-[11px]">{log.entityId}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">IP Address</span>
              <span className="text-slate-700">{log.ipAddress ?? "—"}</span>
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Old Values</span>
            {formatJson(log.oldValues)}
          </div>

          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">New Values</span>
            {formatJson(log.newValues)}
          </div>
        </div>
      </div>
    </div>
  )
}
