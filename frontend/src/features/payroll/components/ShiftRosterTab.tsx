import { useState, useMemo } from "react"
import {
  Plus,
  Info,
  X,
} from "lucide-react"
import { toast } from "sonner"
import dayjs from "dayjs"
import { useRosterCalendar, useDeleteRosterAssignment } from "../hooks/useShiftRoster"
import { useEmployeeList } from "../hooks/useEmployees"
import AssignRosterModal from "./AssignRosterModal"

interface Props {
  monthYear: string
  selectedDepartmentId?: string
}

export default function ShiftRosterTab({ monthYear, selectedDepartmentId }: Props) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedCellDate, setSelectedCellDate] = useState<string | undefined>()

  const { data: rosterData, isLoading: rosterLoading } = useRosterCalendar(
    monthYear,
    selectedDepartmentId
  )
  const { data: employeeData, isLoading: employeesLoading } = useEmployeeList({ pageSize: 200 })

  const deleteMutation = useDeleteRosterAssignment(monthYear)

  const employees = employeeData?.items || []
  const assignments = rosterData?.assignments || []

  // Compute days in month
  const daysInMonth = useMemo(() => {
    const start = dayjs(`${monthYear}-01`)
    const totalDays = start.daysInMonth()
    const days = []
    for (let i = 1; i <= totalDays; i++) {
      const date = start.date(i)
      days.push({
        dayNum: i,
        dateStr: date.format("YYYY-MM-DD"),
        dayName: date.format("ddd"),
        isWeekend: date.day() === 0, // Sunday
      })
    }
    return days
  }, [monthYear])

  // Map assignments by (EmployeeId, Date)
  const assignmentMap = useMemo(() => {
    const map = new Map<string, (typeof assignments)[0]>()
    for (const a of assignments) {
      map.set(`${a.employeeId}_${a.date}`, a)
    }
    return map
  }, [assignments])

  // Filter employees matching selected department if provided
  const visibleEmployees = useMemo(() => {
    if (!selectedDepartmentId) return employees
    return employees.filter((e) => e.departmentId === selectedDepartmentId)
  }, [employees, selectedDepartmentId])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Remove this temporary shift assignment?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Roster assignment removed.")
    } catch {
      toast.error("Failed to remove assignment.")
    }
  }

  const openAssignModalForDay = (dateStr: string) => {
    setSelectedCellDate(dateStr)
    setIsAssignModalOpen(true)
  }

  // Summary Metrics
  const totalNights = assignments.length
  const total14h = assignments.filter((a) => a.shiftDurationMinutes >= 800).length
  const total12h = assignments.filter((a) => a.shiftDurationMinutes < 800).length
  const uniqueWorkersScheduled = new Set(assignments.map((a) => a.employeeId)).size

  return (
    <div className="space-y-4">
      {/* Metrics & Action Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto">
          <div className="border-r border-slate-100 pr-4">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Scheduled Nights
            </span>
            <span className="text-xl font-bold text-indigo-900 font-mono">{totalNights}</span>
          </div>
          <div className="border-r border-slate-100 pr-4">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Night Staff
            </span>
            <span className="text-xl font-bold text-slate-900 font-mono">{uniqueWorkersScheduled}</span>
          </div>
          <div className="border-r border-slate-100 pr-4">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              14h Standard
            </span>
            <span className="text-xl font-bold text-indigo-700 font-mono">{total14h}</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              12h Rotation
            </span>
            <span className="text-xl font-bold text-slate-700 font-mono">{total12h}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedCellDate(undefined)
            setIsAssignModalOpen(true)
          }}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Temporary Shift</span>
        </button>
      </div>

      {/* Legend & Policy Guidance */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span className="font-medium text-slate-700">🌙 Temporary Night Duty (1.5× OT)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-slate-700">☀️ Baseline Day Shift (Contract)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span className="font-medium text-slate-700">💤 Protected Post-Night Rest Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-500">Weekend (Sun)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Click any day column to schedule night duty for that date.</span>
        </div>
      </div>

      {/* Monthly Roster Matrix Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 sticky top-0 z-20 shadow-xs border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold text-slate-700 min-w-[220px] sticky left-0 bg-slate-50 z-30 border-r border-slate-200">
                  Worker & Baseline Shift
                </th>
                {daysInMonth.map((d) => (
                  <th
                    key={d.dateStr}
                    onClick={() => openAssignModalForDay(d.dateStr)}
                    className={`py-2 px-2 text-center min-w-[56px] border-r border-slate-100 cursor-pointer hover:bg-indigo-50/60 transition-colors ${
                      d.isWeekend ? "bg-slate-100/70 text-slate-400" : "text-slate-700"
                    }`}
                  >
                    <div className="font-bold text-xs">{d.dayNum}</div>
                    <div className="text-[9px] uppercase tracking-wider">{d.dayName}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rosterLoading || employeesLoading ? (
                <tr>
                  <td colSpan={daysInMonth.length + 1} className="py-12 text-center text-slate-400">
                    Loading duty roster calendar...
                  </td>
                </tr>
              ) : visibleEmployees.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth.length + 1} className="py-12 text-center text-slate-400">
                    No employees found for this department.
                  </td>
                </tr>
              ) : (
                visibleEmployees.map((emp) => {
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Fixed Left Worker Column */}
                      <td className="py-2.5 px-4 font-medium text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200">
                        <div className="font-semibold text-slate-800">{emp.fullName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <span>{emp.code}</span>
                          <span>•</span>
                          <span
                            className={
                              emp.category === "Salaries Labor"
                                ? "text-emerald-600 font-semibold"
                                : emp.category === "Daily Wages"
                                ? "text-amber-600 font-semibold"
                                : "text-slate-500"
                            }
                          >
                            {emp.category === "Office Staff" ? "Office 9h" : "Labor 10h"}
                          </span>
                        </div>
                      </td>

                      {/* Day Columns */}
                      {daysInMonth.map((d, idx) => {
                        const key = `${emp.id}_${d.dateStr}`
                        const assignment = assignmentMap.get(key)

                        // Check if previous day had an overnight shift with rest protection
                        const prevDateStr = idx > 0 ? daysInMonth[idx - 1].dateStr : null
                        const prevAssignment = prevDateStr
                          ? assignmentMap.get(`${emp.id}_${prevDateStr}`)
                          : null
                        const isPostNightRest =
                          prevAssignment?.isOvernightShift && prevAssignment.excuseOverlappingDayShift

                        return (
                          <td
                            key={d.dateStr}
                            onClick={() => openAssignModalForDay(d.dateStr)}
                            className={`py-1.5 px-1 text-center border-r border-slate-100 transition-colors cursor-pointer group ${
                              d.isWeekend ? "bg-slate-50/50" : ""
                            }`}
                          >
                            {assignment ? (
                              <div
                                title={`${assignment.shiftName} (${assignment.shiftStart.substring(0, 5)} - ${assignment.shiftEnd.substring(0, 5)})\nMultiplier: ${assignment.payMultiplier}×\nReason: ${assignment.reason || "N/A"}`}
                                className="relative group/pill inline-flex items-center justify-center w-full px-1 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold shadow-xs transition-transform hover:scale-105"
                              >
                                <span className="font-mono">
                                  {assignment.shiftDurationMinutes >= 800 ? "14h" : "12h"}
                                </span>
                                <span className="text-[8px] text-indigo-200 ml-0.5">
                                  {assignment.payMultiplier}×
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(assignment.id, e)}
                                  className="hidden group-hover/pill:flex absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-0.5 rounded-full shadow-xs cursor-pointer"
                                  title="Remove assignment"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : isPostNightRest ? (
                              <div
                                title="Automatic Post-Night Rest Day (Excused recovery)"
                                className="inline-flex items-center justify-center w-full px-1 py-1 rounded-lg bg-sky-100 text-sky-800 text-[10px] font-medium"
                              >
                                💤 Rest
                              </div>
                            ) : d.isWeekend ? (
                              <span className="text-[10px] text-slate-300">Off</span>
                            ) : (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-300">
                                ☀️ Day
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Assignment Modal */}
      <AssignRosterModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        monthYear={monthYear}
        defaultDate={selectedCellDate}
      />
    </div>
  )
}
