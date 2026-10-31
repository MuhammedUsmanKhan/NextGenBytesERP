import { useState } from "react"
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  Moon,
  Building,
  HelpCircle,
  Users,
} from "lucide-react"
import { useShifts, useDeleteShift } from "../hooks/useShifts"
import ShiftModal from "./ShiftModal"
import {
  GraceDeductionMode,
  type ShiftDefinitionDto,
} from "@/types/biometric-attendance.types"

interface Props {
  departments: { id: string; name: string }[]
}

export default function ShiftSchedulesTab({ departments }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<ShiftDefinitionDto | null>(null)

  const { data: shifts = [], isLoading } = useShifts()
  const deleteMutation = useDeleteShift()

  const handleCreateNew = () => {
    setEditingShift(null)
    setIsModalOpen(true)
  }

  const handleEdit = (shift: ShiftDefinitionDto) => {
    setEditingShift(shift)
    setIsModalOpen(true)
  }

  const handleDelete = (shift: ShiftDefinitionDto) => {
    if (confirm(`Are you sure you want to delete shift schedule '${shift.name}'?`)) {
      deleteMutation.mutate(shift.id)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display">
            Company Work Schedules & Department Timings
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure expected clock-in/out hours, grace periods, and late arrival deduction rules.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md shadow-blue-100 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shift Schedule</span>
        </button>
      </div>

      {/* 2-Level Hierarchy Explainer Callout */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3.5">
        <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 space-y-1">
          <p className="font-bold text-sm">
            How Department Timings Work (2-Level Automatic Hierarchy)
          </p>
          <p className="text-blue-800 leading-relaxed">
            <strong>1. Department Level:</strong> When a shift is linked to a department, every employee in that department automatically inherits this schedule. You don't have to configure timings for individual staff.<br />
            <strong>2. Individual Override:</strong> If a specific worker operates special hours (e.g., night shift security guard or furnace operator), assign an individual shift override on their employee card in <strong>Staff Directory</strong>.
          </p>
        </div>
      </div>

      {/* Shift Schedules Grid */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          <div className="inline-flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading shift schedules...</span>
          </div>
        </div>
      ) : shifts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500 space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">No Shift Schedules Configured Yet</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create standard company timings (e.g. 10h Factory Day Shift, 9h Office Shift, or Night Shift) to enable automatic biometric late deductions.
          </p>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Shift</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.map((shift) => {
            const durationH = (shift.shiftDurationMinutes / 60).toFixed(1)
            const isStrict = shift.graceMode === GraceDeductionMode.DeductAllFromStart

            return (
              <div
                key={shift.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        shift.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {shift.isActive ? "Active Schedule" : "Inactive"}
                    </span>

                    {shift.isOvernightShift && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Moon className="w-3 h-3 text-indigo-600" />
                        <span>Overnight 1.5×</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-tight">
                    {shift.name}
                  </h4>

                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {shift.departmentName ? (
                        <strong className="text-slate-700">{shift.departmentName}</strong>
                      ) : (
                        <span className="text-slate-400">All Departments (Company-Wide)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Timing Display */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between font-mono">
                    <div className="text-lg font-bold text-slate-900 tracking-tight">
                      {shift.shiftStart?.substring(0, 5)} – {shift.shiftEnd?.substring(0, 5)}
                    </div>
                    <span className="text-xs font-semibold text-blue-600">
                      {durationH}h Shift
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span>Late Grace Window:</span>
                    <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {shift.graceLateMinutes} mins
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Penalty Deduction:</span>
                    <span className="font-medium text-slate-700">
                      {isStrict ? "Full Penalty (Strict)" : "Excess Only (Lenient)"}
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{shift.assignedEmployeeCount ?? 0} assigned</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(shift)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Edit Schedule"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(shift)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal for adding/editing shift */}
      <ShiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shift={editingShift}
        departments={departments}
      />
    </div>
  )
}
