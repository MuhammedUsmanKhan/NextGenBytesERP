import { useState, useEffect } from "react"
import { X, CheckCircle, AlertTriangle, Moon, Clock } from "lucide-react"
import { useResolveAttendanceException } from "../hooks/useBiometricAttendance"
import type { AttendanceExceptionDto } from "@/types/biometric-attendance.types"

interface Props {
  isOpen: boolean
  onClose: () => void
  exception: AttendanceExceptionDto | null
}

export default function ResolveExceptionModal({ isOpen, onClose, exception }: Props) {
  const [punchInTime, setPunchInTime] = useState("")
  const [punchOutTime, setPunchOutTime] = useState("")
  const [markPresentWithStandardHours, setMarkPresentWithStandardHours] = useState(false)
  const [approveAsNightShift, setApproveAsNightShift] = useState(true)
  const [approveOvertime, setApproveOvertime] = useState(true)
  const [notes, setNotes] = useState("")

  const resolveMutation = useResolveAttendanceException()

  useEffect(() => {
    if (exception) {
      const punchIn = exception.firstPunchIn || exception.recordedPunchIn
      const punchOut = exception.lastPunchOut || exception.recordedPunchOut
      const isSingle =
        exception.isSinglePunchMissing ||
        exception.exceptionType === "SINGLE_PUNCH_MISSING" ||
        (punchIn && punchOut && punchIn === punchOut)

      setPunchInTime(punchIn ? punchIn.substring(0, 5) : "")
      setPunchOutTime(punchOut && !isSingle ? punchOut.substring(0, 5) : "")
      setMarkPresentWithStandardHours(false)
      setApproveAsNightShift(true)
      setApproveOvertime(true)
      setNotes("")
    }
  }, [exception])

  if (!isOpen || !exception) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    resolveMutation.mutate(
      {
        id: exception.dailyAttendanceId,
        data: {
          punchInTime: punchInTime ? `${punchInTime}:00` : null,
          punchOutTime: punchOutTime ? `${punchOutTime}:00` : null,
          markPresentWithStandardHours,
          approveAsNightShift,
          approveOvertime,
          approvedMultiplier: 1.5,
          notes: notes.trim() || "Resolved via HR Attendance Review Queue",
        },
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Resolve Attendance Exception
              </h3>
              <p className="text-xs text-slate-500">
                Fix missing punch or mark verified
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Employee & Date Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Employee:</span>
              <span className="font-semibold text-slate-800">
                {exception.employeeName} ({exception.employeeCode})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Shift Date:</span>
              <span className="font-mono text-slate-800">{exception.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Exception:</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                {exception.isSinglePunchMissing
                  ? "Single Punch Only (Missing In/Out)"
                  : exception.exceptionType || "Missing Punch"}
              </span>
            </div>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Punch In Time
              </label>
              <input
                type="time"
                value={punchInTime}
                onChange={(e) => setPunchInTime(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Punch Out Time
              </label>
              <input
                type="time"
                value={punchOutTime}
                onChange={(e) => setPunchOutTime(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Unscheduled Night Shift Approval */}
          {exception.exceptionType === "UNSCHEDULED_NIGHT_SHIFT" && (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-indigo-950 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Unscheduled Night Shift Decision</span>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={approveAsNightShift}
                  onChange={(e) => setApproveAsNightShift(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-0.5"
                />
                <div className="text-xs text-indigo-900">
                  <span className="font-semibold">Approve as 14.0h Overnight Shift (1.5× Rate)</span>
                  <p className="text-[11px] text-indigo-700">
                    Credits full 840 mins night overtime and automatically excuses the next day's daytime shift.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Extra Hours Overtime Approval */}
          {exception.exceptionType === "EXTRA_HOURS_OVERTIME" && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Extra Hours Overtime Review</span>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={approveOvertime}
                  onChange={(e) => setApproveOvertime(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 mt-0.5"
                />
                <div className="text-xs text-amber-900">
                  <span className="font-semibold">Approve Extra Overtime Minutes</span>
                  <p className="text-[11px] text-amber-700">
                    If unchecked, pays scheduled shift duration only and disallows unapproved extra punched time.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Preset Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/60 cursor-pointer">
            <input
              type="checkbox"
              checked={markPresentWithStandardHours}
              onChange={(e) => setMarkPresentWithStandardHours(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="text-xs">
              <span className="font-medium text-slate-800">
                Waive penalties & credit full shift hours
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Sets late minutes to 0 and credits standard shift duration.
              </p>
            </div>
          </label>

          {/* Resolution Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Resolution Reason / Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Forgot departure finger scan, verified on plant CCTV"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolveMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{resolveMutation.isPending ? "Saving..." : "Confirm Resolution"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
