import { useState, useEffect } from "react"
import {
  X,
  CheckCheck,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import {
  useBulkResolvePreview,
  useBulkResolveExceptions,
} from "../hooks/useBiometricAttendance"

interface BulkResolveModalProps {
  isOpen: boolean
  onClose: () => void
  monthYear: string
}

export function BulkResolveModal({ isOpen, onClose, monthYear }: BulkResolveModalProps) {
  const { data: previewItems = [], isLoading } = useBulkResolvePreview(
    monthYear,
    undefined,
    undefined,
    isOpen
  )
  const bulkResolveMutation = useBulkResolveExceptions()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [useRosterEnd, setUseRosterEnd] = useState(true)
  const [approvePremium, setApprovePremium] = useState(true)
  const [supervisorNotes, setSupervisorNotes] = useState(
    "Supervisor bulk approval: shift completions verified with duty roster."
  )
  const [customOutTimes, setCustomOutTimes] = useState<Record<string, string>>({})

  // Initialize selected IDs whenever previewItems change
  useEffect(() => {
    if (previewItems.length > 0) {
      setSelectedIds(new Set(previewItems.map((item) => item.dailyAttendanceId)))
      const times: Record<string, string> = {}
      for (const item of previewItems) {
        if (item.suggestedPunchOut) {
          times[item.dailyAttendanceId] = item.suggestedPunchOut.substring(0, 5)
        }
      }
      setCustomOutTimes(times)
    } else {
      setSelectedIds(new Set())
    }
  }, [previewItems])

  if (!isOpen) return null

  const handleToggleSelectAll = () => {
    if (selectedIds.size === previewItems.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(previewItems.map((i) => i.dailyAttendanceId)))
    }
  }

  const handleToggleRow = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const handleTimeChange = (id: string, val: string) => {
    setCustomOutTimes((prev) => ({ ...prev, [id]: val }))
  }

  const handleConfirm = async () => {
    if (selectedIds.size === 0) return

    await bulkResolveMutation.mutateAsync({
      dailyAttendanceIds: Array.from(selectedIds),
      useRosterShiftEndIfAvailable: useRosterEnd,
      approveBaseWage: true,
      approveOvertimePremium: approvePremium,
      approvedMultiplier: 1.5,
      supervisorNotes,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Bulk Resolve Missing Checkouts</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {monthYear}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Confirm shift completion times suggested from the duty roster and policies.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Scanning single-punch exceptions & duty rosters...</p>
            </div>
          ) : previewItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-emerald-500" />
              <h3 className="font-semibold text-slate-800">All Clear!</h3>
              <p className="text-xs text-slate-500">
                No single-punch missing checkout exceptions found for {monthYear}.
              </p>
            </div>
          ) : (
            <>
              {/* Info banner */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-semibold">
                    Found {previewItems.length} missing checkouts requiring supervisor confirmation.
                  </p>
                  <p className="text-amber-700">
                    Suggested end times (e.g. 08:00 AM for overnight shifts) are auto-detected from duty roster assignments. You can adjust individual rows before saving.
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === previewItems.length && previewItems.length > 0}
                          onChange={handleToggleSelectAll}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Recorded In</th>
                      <th className="py-2.5 px-3">Suggested Out</th>
                      <th className="py-2.5 px-3">Shift Type</th>
                      <th className="py-2.5 px-3">Suggested Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewItems.map((item) => {
                      const isChecked = selectedIds.has(item.dailyAttendanceId)
                      return (
                        <tr
                          key={item.dailyAttendanceId}
                          className={`hover:bg-slate-50/60 transition-colors ${
                            isChecked ? "bg-blue-50/30" : ""
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleRow(item.dailyAttendanceId)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-3 font-mono font-medium text-slate-800">
                            {item.date}
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-slate-900">{item.employeeName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {item.employeeCode}
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono font-medium text-slate-700">
                            {item.recordedPunchIn ? item.recordedPunchIn.substring(0, 5) : "--:--"}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="time"
                              value={customOutTimes[item.dailyAttendanceId] ?? "08:00"}
                              onChange={(e) => handleTimeChange(item.dailyAttendanceId, e.target.value)}
                              className="px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                            />
                          </td>
                          <td className="py-2 px-3">
                            {item.isNightShift ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Night Shift (14h)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                                Day Shift
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {item.suggestedSource === "ROSTER_SHIFT_END" ? (
                              <span className="text-[11px] font-medium text-blue-700 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                Roster End
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                Standard Policy
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Options & Notes */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useRosterEnd}
                      onChange={(e) => setUseRosterEnd(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium">Use Duty Roster end times where available</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={approvePremium}
                      onChange={(e) => setApprovePremium(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium">Approve 1.5× Night Shift & Overtime Multiplier</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supervisor Audit Notes (Required for factory audit log)
                  </label>
                  <input
                    type="text"
                    value={supervisorNotes}
                    onChange={(e) => setSupervisorNotes(e.target.value)}
                    placeholder="Enter reason or verification confirmation..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Selected: <span className="font-bold text-slate-900">{selectedIds.size}</span> of{" "}
            <span className="font-bold text-slate-900">{previewItems.length}</span> exceptions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={bulkResolveMutation.isPending}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.size === 0 || bulkResolveMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors"
            >
              {bulkResolveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Applying Resolution...</span>
                </>
              ) : (
                <>
                  <CheckCheck className="w-4 h-4" />
                  <span>Confirm Resolution ({selectedIds.size})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

