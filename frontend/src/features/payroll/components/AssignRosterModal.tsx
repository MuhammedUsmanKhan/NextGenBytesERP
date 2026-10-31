import { useState, useMemo } from "react"
import {
  X,
  Moon,
  Clock,
  Calendar,
  Users,
  CheckSquare,
  Square,
  Zap,
  ShieldCheck,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import { useEmployeeList } from "../hooks/useEmployees"
import { useBulkAssignRoster } from "../hooks/useShiftRoster"
import type { BulkAssignRosterRequest } from "@/types/shift-roster.types"

interface Props {
  isOpen: boolean
  onClose: () => void
  monthYear: string
  defaultDate?: string
}

export default function AssignRosterModal({ isOpen, onClose, monthYear, defaultDate }: Props) {
  const initialDate = defaultDate || `${monthYear}-15`
  const [startDate, setStartDate] = useState(initialDate)
  const [endDate, setEndDate] = useState(initialDate)

  const [template, setTemplate] = useState<"14h" | "12h" | "custom">("14h")
  const [shiftName, setShiftName] = useState("Factory Night Shift (14.0h)")
  const [shiftStart, setShiftStart] = useState("18:00")
  const [shiftEnd, setShiftEnd] = useState("08:00")
  const [shiftDurationMinutes, setShiftDurationMinutes] = useState(840)
  const [isOvernightShift, setIsOvernightShift] = useState(true)

  const [payMultiplier, setPayMultiplier] = useState(1.5)
  const [excuseOverlappingDayShift, setExcuseOverlappingDayShift] = useState(true)
  const [reason, setReason] = useState("Overnight Production Batch")

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const { data: employeeData, isLoading: employeesLoading } = useEmployeeList({ pageSize: 200 })
  const employees = employeeData?.items || []

  const bulkAssignMutation = useBulkAssignRoster(monthYear)

  const handleTemplateChange = (t: "14h" | "12h" | "custom") => {
    setTemplate(t)
    if (t === "14h") {
      setShiftName("Factory Night Shift (14.0h)")
      setShiftStart("18:00")
      setShiftEnd("08:00")
      setShiftDurationMinutes(840)
      setIsOvernightShift(true)
    } else if (t === "12h") {
      setShiftName("Special Night Shift (12.0h)")
      setShiftStart("18:00")
      setShiftEnd("06:00")
      setShiftDurationMinutes(720)
      setIsOvernightShift(true)
    }
  }

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.departmentName && e.departmentName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [employees, searchQuery])

  const toggleEmployee = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const selectAllLabor = () => {
    const laborIds = employees
      .filter((e) => e.category === "Salaries Labor" || e.category === "Daily Wages")
      .map((e) => e.id)
    setSelectedIds(laborIds)
  }

  const selectAllFiltered = () => {
    setSelectedIds(filteredEmployees.map((e) => e.id))
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedIds.length === 0) {
      toast.error("Please select at least one employee.")
      return
    }

    if (endDate < startDate) {
      toast.error("End date cannot be earlier than start date.")
      return
    }

    const request: BulkAssignRosterRequest = {
      employeeIds: selectedIds,
      startDate,
      endDate,
      shiftName,
      shiftStart,
      shiftEnd,
      shiftDurationMinutes,
      isOvernightShift,
      payMultiplier,
      excuseOverlappingDayShift,
      reason: reason || undefined,
    }

    try {
      await bulkAssignMutation.mutateAsync(request)
      toast.success(
        `Successfully scheduled ${selectedIds.length} worker(s) for ${shiftName}!`
      )
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to assign temporary shift.")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[90vh] flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Schedule Temporary Night Duty
              </h3>
              <p className="text-xs text-slate-500">
                Assign temporary overnight production runs to workers without changing their normal day schedule.
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Date Range */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>1. Target Date Range</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Shift Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    if (endDate < e.target.value) setEndDate(e.target.value)
                  }}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Shift End Date (Multi-day batch)</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shift Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>2. Shift Timing Template</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <button
                type="button"
                onClick={() => handleTemplateChange("14h")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  template === "14h"
                    ? "bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs ring-1 ring-indigo-500"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs">14.0h Standard</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-200/60 text-indigo-800">
                    Client Master
                  </span>
                </div>
                <div className="text-xs font-mono font-medium text-slate-800">18:00 – 08:00 Next Day</div>
                <div className="text-[11px] text-slate-500 mt-0.5">840 minutes overnight marathon</div>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateChange("12h")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  template === "12h"
                    ? "bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs ring-1 ring-indigo-500"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs">12.0h Rotation</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Special Labor
                  </span>
                </div>
                <div className="text-xs font-mono font-medium text-slate-800">18:00 – 06:00 Next Day</div>
                <div className="text-[11px] text-slate-500 mt-0.5">720 minutes rotation shift</div>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateChange("custom")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  template === "custom"
                    ? "bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs ring-1 ring-indigo-500"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="font-semibold text-xs mb-1">Custom Hours</div>
                <div className="text-xs text-slate-500">Configure custom start & end window</div>
              </button>
            </div>

            {template === "custom" && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Shift Name</label>
                  <input
                    type="text"
                    value={shiftName}
                    onChange={(e) => setShiftName(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Start Time (24h)</label>
                  <input
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">End Time (24h)</label>
                  <input
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Pay Multiplier & Rest Protection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pay Rate Multiplier</span>
                </span>
                <span className="font-mono text-xs font-bold text-indigo-700">{payMultiplier}× Rate</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPayMultiplier(1.5)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                    payMultiplier === 1.5
                      ? "bg-amber-500 text-white font-semibold shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  1.5× Client Overtime
                </button>
                <button
                  type="button"
                  onClick={() => setPayMultiplier(1.0)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                    payMultiplier === 1.0
                      ? "bg-slate-800 text-white font-semibold shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  1.0× Normal Flat
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Factory labor night shifts calculate at 1.5× basic minute rate.
              </p>
            </div>

            <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl flex flex-col justify-between">
              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-1">
                  <input
                    type="checkbox"
                    checked={excuseOverlappingDayShift}
                    onChange={(e) => setExcuseOverlappingDayShift(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-indigo-950 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Automatic Post-Night Rest Protection</span>
                  </span>
                </label>
                <p className="text-[11px] text-indigo-800/80 leading-relaxed ml-6">
                  Prevents false "Absent" deductions on daytime shifts following an overnight marathon run.
                </p>
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Order / Batch Reason (optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Employee Multi-Select */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>3. Assign Workers ({selectedIds.length} Selected)</span>
              </label>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllLabor}
                  className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
                >
                  Select All Factory Labor
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Select Shown
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search worker by name, code or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Workers List */}
            <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
              {employeesLoading ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading employees...</div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No matching employees found</div>
              ) : (
                filteredEmployees.map((emp) => {
                  const isChecked = selectedIds.includes(emp.id)
                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleEmployee(emp.id)}
                      className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors ${
                        isChecked ? "bg-indigo-50/70" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="text-indigo-600">
                          {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{emp.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {emp.code} • {emp.departmentName || "No Dept"} • {emp.category}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            emp.category === "Salaries Labor"
                              ? "bg-emerald-100 text-emerald-800"
                              : emp.category === "Daily Wages"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {emp.category}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{selectedIds.length}</span> workers will be scheduled
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bulkAssignMutation.isPending || selectedIds.length === 0}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {bulkAssignMutation.isPending ? "Scheduling..." : "Confirm & Schedule Shift"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
