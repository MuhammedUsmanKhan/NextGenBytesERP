import { useState, useEffect } from "react"
import { X, Clock, Moon, CheckCircle2 } from "lucide-react"
import { useCreateShift, useUpdateShift } from "../hooks/useShifts"
import {
  GraceDeductionMode,
  type ShiftDefinitionDto,
  type CreateShiftDefinitionRequest,
  type UpdateShiftDefinitionRequest,
} from "@/types/biometric-attendance.types"

interface Props {
  isOpen: boolean
  onClose: () => void
  shift?: ShiftDefinitionDto | null
  departments: { id: string; name: string }[]
}

export default function ShiftModal({ isOpen, onClose, shift, departments }: Props) {
  const [name, setName] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [shiftStart, setShiftStart] = useState("08:00")
  const [shiftEnd, setShiftEnd] = useState("18:00")
  const [graceLateMinutes, setGraceLateMinutes] = useState(10)
  const [graceMode, setGraceMode] = useState<GraceDeductionMode>(GraceDeductionMode.DeductAllFromStart)
  const [isOvernightShift, setIsOvernightShift] = useState(false)
  const [nightShiftStart, setNightShiftStart] = useState("18:00")
  const [nightShiftEnd, setNightShiftEnd] = useState("06:00")
  const [isActive, setIsActive] = useState(true)

  const createMutation = useCreateShift()
  const updateMutation = useUpdateShift()

  useEffect(() => {
    if (shift) {
      setName(shift.name)
      setDepartmentId(shift.departmentId || "")
      setShiftStart(shift.shiftStart ? shift.shiftStart.substring(0, 5) : "08:00")
      setShiftEnd(shift.shiftEnd ? shift.shiftEnd.substring(0, 5) : "18:00")
      setGraceLateMinutes(shift.graceLateMinutes ?? 10)
      setGraceMode(shift.graceMode ?? GraceDeductionMode.DeductAllFromStart)
      setIsOvernightShift(Boolean(shift.isOvernightShift))
      setNightShiftStart(shift.nightShiftStart ? shift.nightShiftStart.substring(0, 5) : "18:00")
      setNightShiftEnd(shift.nightShiftEnd ? shift.nightShiftEnd.substring(0, 5) : "06:00")
      setIsActive(shift.isActive ?? true)
    } else {
      setName("")
      setDepartmentId("")
      setShiftStart("08:00")
      setShiftEnd("18:00")
      setGraceLateMinutes(10)
      setGraceMode(GraceDeductionMode.DeductAllFromStart)
      setIsOvernightShift(false)
      setNightShiftStart("18:00")
      setNightShiftEnd("06:00")
      setIsActive(true)
    }
  }, [shift, isOpen])

  if (!isOpen) return null

  // Calculate duration in minutes from start to end
  const calculateDurationMinutes = (start: string, end: string, overnight: boolean) => {
    const [sH, sM] = start.split(":").map(Number)
    const [eH, eM] = end.split(":").map(Number)
    const startM = sH * 60 + sM
    let endM = eH * 60 + eM
    if (overnight || endM <= startM) {
      endM += 24 * 60
    }
    return endM - startM
  }

  const durationMinutes = calculateDurationMinutes(shiftStart, shiftEnd, isOvernightShift)
  const durationHours = (durationMinutes / 60).toFixed(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formattedStart = `${shiftStart}:00`
    const formattedEnd = `${shiftEnd}:00`

    if (shift) {
      const updateData: UpdateShiftDefinitionRequest = {
        name: name.trim(),
        departmentId: departmentId || null,
        shiftStart: formattedStart,
        shiftEnd: formattedEnd,
        shiftDurationMinutes: durationMinutes,
        graceLateMinutes: Number(graceLateMinutes) || 0,
        graceMode,
        isOvernightShift,
        nightShiftStart: isOvernightShift ? `${nightShiftStart}:00` : "18:00:00",
        nightShiftEnd: isOvernightShift ? `${nightShiftEnd}:00` : "06:00:00",
        isActive,
      }

      updateMutation.mutate(
        { id: shift.id, data: updateData },
        {
          onSuccess: () => onClose(),
        }
      )
    } else {
      const createData: CreateShiftDefinitionRequest = {
        name: name.trim(),
        departmentId: departmentId || null,
        shiftStart: formattedStart,
        shiftEnd: formattedEnd,
        shiftDurationMinutes: durationMinutes,
        graceLateMinutes: Number(graceLateMinutes) || 0,
        graceMode,
        isOvernightShift,
        nightShiftStart: isOvernightShift ? `${nightShiftStart}:00` : "18:00:00",
        nightShiftEnd: isOvernightShift ? `${nightShiftEnd}:00` : "06:00:00",
      }

      createMutation.mutate(createData, {
        onSuccess: () => onClose(),
      })
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {shift ? "Edit Work Schedule & Shift Timing" : "Add New Work Schedule"}
              </h3>
              <p className="text-xs text-slate-500">
                Configure shift hours, grace late arrival windows, and penalty rules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Shift Name & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Shift Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Factory Day Shift (10h)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Linked Department <span className="text-slate-400 font-normal">(Optional default)</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Company-Wide / No Department Link</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timings */}
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/60 space-y-3">
            <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Shift Timing & Working Hours</span>
              <span className="text-blue-600 font-mono font-bold">
                {durationHours} Hours ({durationMinutes} mins)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Start Time (Check-In)
                </label>
                <input
                  type="time"
                  required
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-1.5 text-slate-800 font-mono bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  End Time (Check-Out)
                </label>
                <input
                  type="time"
                  required
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-1.5 text-slate-800 font-mono bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Overnight Toggle */}
            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isOvernightShift}
                onChange={(e) => setIsOvernightShift(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Overnight Cross-Midnight Shift (e.g. 18:00 evening to 08:00 next morning)</span>
              </span>
            </label>
          </div>

          {/* Grace Period & Penalty Policy */}
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/60 space-y-3">
            <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Late Arrival Grace Window & Penalty Policy</span>
              <span className="text-amber-600 font-mono font-bold">
                {graceLateMinutes} mins allowed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Grace Arrival (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  required
                  value={graceLateMinutes}
                  onChange={(e) => setGraceLateMinutes(Number(e.target.value))}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-1.5 text-slate-800 font-mono bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Deduction Penalty Rule
                </label>
                <select
                  value={graceMode}
                  onChange={(e) => setGraceMode(Number(e.target.value) as GraceDeductionMode)}
                  className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value={GraceDeductionMode.DeductAllFromStart}>
                    Deduct full time from shift start if breached (Strict)
                  </option>
                  <option value={GraceDeductionMode.DeductExcessPastGrace}>
                    Deduct only excess minutes past grace (Lenient)
                  </option>
                </select>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
              {graceMode === GraceDeductionMode.DeductAllFromStart ? (
                <span>
                  <strong>Strict Rule:</strong> Arriving within {graceLateMinutes} minutes is marked on-time (0m late).
                  Arriving at {graceLateMinutes + 1} minutes forfeits grace and deducts the full {graceLateMinutes + 1} minutes from shift start.
                </span>
              ) : (
                <span>
                  <strong>Lenient Rule:</strong> The first {graceLateMinutes} minutes are forgiven.
                  Arriving 15 minutes late only incurs a 5-minute late penalty.
                </span>
              )}
            </div>
          </div>

          {/* Active status */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-slate-700">Active Schedule</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md shadow-blue-100 transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : shift ? "Update Shift" : "Create Shift"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
