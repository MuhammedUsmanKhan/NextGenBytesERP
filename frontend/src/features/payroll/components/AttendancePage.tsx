import { useState, useEffect, useMemo } from "react"
import {
  CalendarCheck,
  Search,
  Save,
  RotateCcw,
  Clock,
  Moon,
  AlertCircle,
  CheckCircle2,
  Users,
  UploadCloud,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Check,
  CheckCheck,
  Settings2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useDefinitionList } from "@/hooks"
import { useMonthAttendance, useBulkUpsertAttendance } from "../hooks/useAttendance"
import {
  useDailyAttendance,
  useAttendanceExceptions,
  useSyncBiometricSummary,
  useRecalculateAttendance,
} from "../hooks/useBiometricAttendance"
import BiometricUploadModal from "./BiometricUploadModal"
import ResolveExceptionModal from "./ResolveExceptionModal"
import { BulkResolveModal } from "./BulkResolveModal"
import ShiftSchedulesTab from "./ShiftSchedulesTab"
import ShiftRosterTab from "./ShiftRosterTab"
import { PayType } from "@/types/employee.types"
import type { UpsertAttendanceItem } from "@/types/attendance.types"
import type { AttendanceExceptionDto } from "@/types/biometric-attendance.types"

type ActiveTab = "roster" | "daily" | "exceptions" | "duty-roster" | "shifts"

interface EditableRow {
  employeeId: string
  employeeCode: string
  employeeName: string
  category: string
  departmentName: string | null
  payType: PayType
  dailyShiftHours: number
  defaultNightShiftMinutes: number

  // Editable values
  daysPresent: number
  pendingExceptionsCount: number
  absentDays: number
  lateMinutes: number
  nightShiftsCount: number
  overtimeMinutes: number
  isDirty: boolean
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("roster")
  const [monthYear, setMonthYear] = useState("2026-08")
  const [category, setCategory] = useState("")
  const [search, setSearch] = useState("")
  const [rows, setRows] = useState<Record<string, EditableRow>>({})

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isBulkResolveModalOpen, setIsBulkResolveModalOpen] = useState(false)
  const [selectedException, setSelectedException] = useState<AttendanceExceptionDto | null>(null)

  // Daily punch filters & pagination
  const [dailyStartDate, setDailyStartDate] = useState("2026-08-01")
  const [dailyEndDate, setDailyEndDate] = useState("2026-08-31")
  const [dailyHasException, setDailyHasException] = useState<boolean | undefined>(undefined)
  const [dailyPage, setDailyPage] = useState(1)
  const [dailyPageSize, setDailyPageSize] = useState(50)

  // Exceptions filters & pagination
  const [exceptionFilterType, setExceptionFilterType] = useState<string>("ALL")
  const [exceptionSearch, setExceptionSearch] = useState("")
  const [exceptionPage, setExceptionPage] = useState(1)
  const [exceptionPageSize, setExceptionPageSize] = useState(25)

  // Handle global month change across all tabs
  const handleMonthChange = (newMonth: string) => {
    setMonthYear(newMonth)
    if (newMonth) {
      const [yearStr, monthStr] = newMonth.split("-")
      const year = Number(yearStr)
      const month = Number(monthStr)
      if (!isNaN(year) && !isNaN(month)) {
        const lastDay = new Date(year, month, 0).getDate()
        setDailyStartDate(`${newMonth}-01`)
        setDailyEndDate(`${newMonth}-${String(lastDay).padStart(2, "0")}`)
        setDailyPage(1)
        setExceptionPage(1)
      }
    }
  }

  // React Query hooks
  const { data: attendanceData, isLoading, refetch } = useMonthAttendance({
    monthYear,
    category: category || undefined,
    search: search || undefined,
  })

  const bulkMutation = useBulkUpsertAttendance()
  const syncMutation = useSyncBiometricSummary()
  const recalcMutation = useRecalculateAttendance()

  const { data: deptData } = useDefinitionList("departments", { page: 1, pageSize: 100 })
  const departments = deptData?.items?.map((d: any) => ({ id: d.id, name: d.name })) || []

  const { data: exceptions = [], isLoading: isLoadingExceptions } = useAttendanceExceptions(monthYear)

  const { data: dailyData, isLoading: isLoadingDaily } = useDailyAttendance({
    startDate: dailyStartDate || undefined,
    endDate: dailyEndDate || undefined,
    hasException: dailyHasException,
    page: dailyPage,
    pageSize: dailyPageSize,
  })

  // Sync server data into local editable state for roster
  useEffect(() => {
    if (!attendanceData) return

    const initialMap: Record<string, EditableRow> = {}
    for (const item of attendanceData) {
      initialMap[item.employeeId] = {
        employeeId: item.employeeId,
        employeeCode: item.employeeCode,
        employeeName: item.employeeName,
        category: item.category,
        departmentName: item.departmentName,
        payType: item.payType,
        dailyShiftHours: item.dailyShiftHours,
        defaultNightShiftMinutes: item.defaultNightShiftMinutes,
        daysPresent: item.daysPresent,
        pendingExceptionsCount: item.pendingExceptionsCount ?? 0,
        absentDays: item.absentDays,
        lateMinutes: item.lateMinutes,
        nightShiftsCount: item.nightShiftsCount,
        overtimeMinutes: item.overtimeMinutes,
        isDirty: false,
      }
    }
    setRows(initialMap)
  }, [attendanceData])

  const handleCellChange = (
    employeeId: string,
    field: keyof EditableRow,
    value: number
  ) => {
    setRows((prev) => {
      const current = prev[employeeId]
      if (!current) return prev

      return {
        ...prev,
        [employeeId]: {
          ...current,
          [field]: value,
          isDirty: true,
        },
      }
    })
  }

  const dirtyCount = useMemo(() => {
    return Object.values(rows).filter((r) => r.isDirty).length
  }, [rows])

  const handleSaveAll = () => {
    const dirtyItems = Object.values(rows).filter((r) => r.isDirty)
    if (dirtyItems.length === 0) return

    const items: UpsertAttendanceItem[] = dirtyItems.map((r) => ({
      employeeId: r.employeeId,
      daysPresent: Number(r.daysPresent) || 0,
      absentDays: Number(r.absentDays) || 0,
      lateMinutes: Number(r.lateMinutes) || 0,
      overtimeMinutes: Number(r.overtimeMinutes) || 0,
      overtimeHours: Math.round(((Number(r.overtimeMinutes) || 0) / 60) * 100) / 100,
      nightShiftsCount: Number(r.nightShiftsCount) || 0,
    }))

    bulkMutation.mutate(
      { monthYear, items },
      {
        onSuccess: () => {
          setRows((prev) => {
            const next = { ...prev }
            for (const key of Object.keys(next)) {
              next[key] = { ...next[key], isDirty: false }
            }
            return next
          })
          refetch()
        },
      }
    )
  }

  const handleReset = () => {
    if (confirm("Discard all unsaved edits?")) {
      refetch()
    }
  }

  const handleSyncFromBiometric = () => {
    if (confirm(`Aggregate and sync all biometric daily logs into the ${monthYear} Monthly Roster?`)) {
      syncMutation.mutate(monthYear, {
        onSuccess: () => {
          refetch()
        },
      })
    }
  }

  const handleRecalculateAttendance = () => {
    recalcMutation.mutate(
      { monthYear },
      {
        onSuccess: () => {
          refetch()
        },
      }
    )
  }

  // Summary Metrics calculations
  const stats = useMemo(() => {
    const items = Object.values(rows)
    return {
      totalEmployees: items.length,
      totalAbsentDays: items.reduce((acc, r) => acc + (Number(r.absentDays) || 0), 0),
      totalLateMinutes: items.reduce((acc, r) => acc + (Number(r.lateMinutes) || 0), 0),
      totalNightShifts: items.reduce((acc, r) => acc + (Number(r.nightShiftsCount) || 0), 0),
      totalOvertimeMinutes: items.reduce((acc, r) => acc + (Number(r.overtimeMinutes) || 0), 0),
    }
  }, [rows])

  // Exceptions breakdown and search filter
  const exceptionCounts = useMemo(() => {
    return {
      all: exceptions.length,
      singlePunch: exceptions.filter(
        (e) => e.isSinglePunchMissing || e.exceptionType === "SINGLE_PUNCH_MISSING"
      ).length,
      night: exceptions.filter((e) => e.exceptionType === "UNSCHEDULED_NIGHT_SHIFT").length,
      overtime: exceptions.filter((e) => e.exceptionType === "EXTRA_HOURS_OVERTIME").length,
    }
  }, [exceptions])

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((ex) => {
      const isSingle = ex.isSinglePunchMissing || ex.exceptionType === "SINGLE_PUNCH_MISSING"
      if (exceptionFilterType === "SINGLE_PUNCH" && !isSingle) return false
      if (exceptionFilterType === "NIGHT" && ex.exceptionType !== "UNSCHEDULED_NIGHT_SHIFT") return false
      if (exceptionFilterType === "OVERTIME" && ex.exceptionType !== "EXTRA_HOURS_OVERTIME") return false

      if (exceptionSearch.trim()) {
        const query = exceptionSearch.toLowerCase().trim()
        const matchName = ex.employeeName.toLowerCase().includes(query)
        const matchCode = ex.employeeCode.toLowerCase().includes(query)
        if (!matchName && !matchCode) return false
      }

      return true
    })
  }, [exceptions, exceptionFilterType, exceptionSearch])

  const paginatedExceptions = useMemo(() => {
    const start = (exceptionPage - 1) * exceptionPageSize
    return filteredExceptions.slice(start, start + exceptionPageSize)
  }, [filteredExceptions, exceptionPage, exceptionPageSize])

  const renderPunchDetails = (ex: AttendanceExceptionDto) => {
    const pIn = ex.firstPunchIn || ex.recordedPunchIn
    const pOut = ex.lastPunchOut || ex.recordedPunchOut
    const isSingle =
      ex.isSinglePunchMissing ||
      ex.exceptionType === "SINGLE_PUNCH_MISSING" ||
      (pIn && pOut && pIn === pOut)

    if (pIn && isSingle) {
      return (
        <span className="text-slate-800 font-medium">
          In: {pIn.substring(0, 5)}{" "}
          <span className="text-amber-600 font-semibold">(No Out)</span>
        </span>
      )
    }
    if (!pIn && pOut) {
      return (
        <span className="text-slate-800 font-medium">
          Out: {pOut.substring(0, 5)}{" "}
          <span className="text-amber-600 font-semibold">(No In)</span>
        </span>
      )
    }
    if (pIn && pOut && pIn !== pOut) {
      // Determine if checkout occurred on the next calendar day
      const isOvernight =
        pOut < pIn ||
        (pIn.startsWith("08:") && pOut.startsWith("08:")) ||
        ex.exceptionType === "UNSCHEDULED_NIGHT_SHIFT"

      const isDoubleShift = pIn.startsWith("08:") && pOut.startsWith("08:")

      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-800 font-medium">
            {pIn.substring(0, 5)} - {pOut.substring(0, 5)}
          </span>
          {isOvernight && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                isDoubleShift
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
              }`}
              title={
                isDoubleShift
                  ? "24-Hour Continuous Double Shift (Day Shift + Overnight Shift)"
                  : "Overnight shift (Punched out on the following morning)"
              }
            >
              {isDoubleShift ? "+1d (24h Double)" : "+1d Next Day"}
            </span>
          )}
        </div>
      )
    }
    return <span className="text-slate-400">--:--</span>
  }

  const rowList = Object.values(rows)

  return (
    <div className="space-y-6">
      {/* Top Header with Global Month Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-7 h-7 text-blue-600" />
            <span>Attendance & Shift Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Biometric punch logs, shift pairing, exception review, and monthly payroll rosters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Global Payroll Month Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Payroll Month:</span>
            <input
              type="month"
              value={monthYear}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent focus:outline-hidden font-mono cursor-pointer"
            />
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-blue-400" />
            <span>Upload Biometric (.dat)</span>
          </button>

          <button
            onClick={handleRecalculateAttendance}
            disabled={recalcMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Re-pair punches and recalculate late minutes and overtime from latest rosters"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${recalcMutation.isPending ? "animate-spin" : ""}`} />
            <span>{recalcMutation.isPending ? "Recalculating..." : "Recalculate Attendance"}</span>
          </button>

          <button
            onClick={handleSyncFromBiometric}
            disabled={syncMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Recalculate monthly totals from paired daily attendance punches"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            <span>{syncMutation.isPending ? "Syncing..." : "Sync from Punches"}</span>
          </button>

          {exceptions.length > 0 && (
            <button
              onClick={() => setIsBulkResolveModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-2xs transition-colors cursor-pointer"
              title="Bulk resolve single-punch missing checkouts with suggested shift end times"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Bulk Resolve ({exceptions.length})</span>
            </button>
          )}

          {activeTab === "roster" && dirtyCount > 0 && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard ({dirtyCount})</span>
            </button>
          )}

          {activeTab === "roster" && (
            <button
              onClick={handleSaveAll}
              disabled={dirtyCount === 0 || bulkMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md shadow-blue-100 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {bulkMutation.isPending
                  ? "Saving..."
                  : dirtyCount > 0
                  ? `Save ${dirtyCount} Changes`
                  : "All Saved"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("roster")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "roster"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Monthly Summary Roster</span>
        </button>

        <button
          onClick={() => setActiveTab("daily")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "daily"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Daily Punch Pairing</span>
          {dailyData?.totalCount !== undefined && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {dailyData.totalCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("exceptions")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "exceptions"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Exceptions Review Queue</span>
          {exceptions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
              {exceptions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("duty-roster")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "duty-roster"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Duty Roster & Scheduling</span>
        </button>

        <button
          onClick={() => setActiveTab("shifts")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "shifts"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>Shift Schedules & Policies</span>
        </button>
      </div>

      {/* Tab 1: Monthly Summary Roster */}
      {activeTab === "roster" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Active Staff</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">{stats.totalEmployees}</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Total Absents</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-600">{stats.totalAbsentDays} d</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>Late Arrivals</span>
              </div>
              <div className="text-xl font-bold font-mono text-rose-600">
                {stats.totalLateMinutes.toLocaleString()} m
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Night Shifts</span>
              </div>
              <div className="text-xl font-bold font-mono text-indigo-600">{stats.totalNightShifts}</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Overtime</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-600">
                {stats.totalOvertimeMinutes.toLocaleString()} m{" "}
                <span className="text-xs font-normal text-slate-400">
                  ({(stats.totalOvertimeMinutes / 60).toFixed(1)}h)
                </span>
              </div>
            </div>
          </div>

          {/* Pre-Payroll Exception Alert Banner */}
          {exceptions.length > 0 && (
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <span>Action Required: {exceptions.length} Attendance Exceptions in {monthYear}</span>
                  </h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Missing checkouts and unscheduled shifts must be resolved before monthly payroll calculations are finalized.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsBulkResolveModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Bulk Resolve Missing Checkouts</span>
                </button>
              </div>
            </div>
          )}

          {/* Filter Ribbon */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Active Month:</span>
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                  {monthYear}
                </span>
                <span className="text-xs text-slate-400">({rowList.length} employees)</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { label: "All Categories", value: "" },
                  { label: "Salaries Labor", value: "Salaries Labor" },
                  { label: "Daily Wages", value: "Daily Wages" },
                  { label: "Office Staff", value: "Office Staff" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setCategory(tab.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      category === tab.value
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Editable Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Employee</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 w-24">Present</th>
                    <th className="py-3.5 px-4 w-28">Pending Review</th>
                    <th className="py-3.5 px-4 w-24">True Absent</th>
                    <th className="py-3.5 px-4 w-24">Late (Mins)</th>
                    <th className="py-3.5 px-4 w-32">Nights (Count)</th>
                    <th className="py-3.5 px-4 w-32">Overtime (Mins)</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Loading attendance roster for {monthYear}...</span>
                        </div>
                      </td>
                    </tr>
                  ) : rowList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No active employees found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    rowList.map((r) => {
                      return (
                        <tr
                          key={r.employeeId}
                          className={`hover:bg-slate-50/60 transition-colors ${
                            r.isDirty ? "bg-blue-50/40" : ""
                          }`}
                        >
                          <td className="py-2.5 px-4 font-mono font-medium text-slate-700">
                            {r.employeeCode}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-900">{r.employeeName}</div>
                            <div className="text-[10px] text-slate-400">
                              {r.dailyShiftHours}h Shift · {r.defaultNightShiftMinutes}m Nights
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                              {r.category}
                            </span>
                          </td>

                          <td className="py-2.5 px-4">
                            <input
                              type="number"
                              min="0"
                              max="31"
                              step="1"
                              value={r.daysPresent ?? ""}
                              onChange={(e) =>
                                handleCellChange(
                                  r.employeeId,
                                  "daysPresent",
                                  Number(e.target.value)
                                )
                              }
                              className="w-16 text-xs font-semibold rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-center text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                          </td>

                          <td className="py-2.5 px-4">
                            {r.pendingExceptionsCount > 0 ? (
                              <button
                                onClick={() => setIsBulkResolveModalOpen(true)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-colors cursor-pointer"
                                title="Click to bulk resolve single-punch exceptions"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>{r.pendingExceptionsCount} Pending</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Clear</span>
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-4">
                            <input
                              type="number"
                              min="0"
                              max="31"
                              step="1"
                              value={r.absentDays ?? ""}
                              onChange={(e) =>
                                handleCellChange(
                                  r.employeeId,
                                  "absentDays",
                                  Number(e.target.value)
                                )
                              }
                              className={`w-16 text-xs font-semibold rounded-lg border px-2 py-1.5 font-mono text-center focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                                r.absentDays > 0
                                  ? "border-rose-300 bg-rose-50/50 text-rose-700 font-bold"
                                  : "border-slate-300 text-slate-900"
                              }`}
                            />
                          </td>

                          <td className="py-2.5 px-4">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={r.lateMinutes ?? ""}
                              onChange={(e) =>
                                handleCellChange(
                                  r.employeeId,
                                  "lateMinutes",
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 text-xs font-semibold rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-center text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                          </td>

                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max="31"
                                step="1"
                                value={r.nightShiftsCount ?? ""}
                                onChange={(e) =>
                                  handleCellChange(
                                    r.employeeId,
                                    "nightShiftsCount",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-16 text-xs font-semibold rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-center text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                              />
                              {r.nightShiftsCount > 0 && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ({r.nightShiftsCount * r.defaultNightShiftMinutes}m)
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={r.overtimeMinutes ?? ""}
                                onChange={(e) =>
                                  handleCellChange(
                                    r.employeeId,
                                    "overtimeMinutes",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-20 text-xs font-semibold rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-center text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                              />
                              {r.overtimeMinutes > 0 && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ({(r.overtimeMinutes / 60).toFixed(1)}h)
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-2.5 px-4 text-center">
                            {r.isDirty ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Edited
                              </span>
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Punch Pairing */}
      {activeTab === "daily" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Daily Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">From Date:</span>
                <input
                  type="date"
                  value={dailyStartDate}
                  onChange={(e) => {
                    setDailyStartDate(e.target.value)
                    setDailyPage(1)
                  }}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-800 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">To Date:</span>
                <input
                  type="date"
                  value={dailyEndDate}
                  onChange={(e) => {
                    setDailyEndDate(e.target.value)
                    setDailyPage(1)
                  }}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-800 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Filter Status:</span>
                <select
                  value={dailyHasException === undefined ? "" : String(dailyHasException)}
                  onChange={(e) => {
                    const val = e.target.value
                    setDailyHasException(val === "" ? undefined : val === "true")
                    setDailyPage(1)
                  }}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-800"
                >
                  <option value="">All Daily Records</option>
                  <option value="true">Exceptions Only</option>
                  <option value="false">Clean Paired Shifts</option>
                </select>
              </div>
            </div>

            {/* Quick date presets */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDailyStartDate("2026-08-01")
                  setDailyEndDate("2026-08-31")
                  setDailyPage(1)
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px] hover:bg-blue-100 cursor-pointer"
              >
                August 2026
              </button>
              <button
                type="button"
                onClick={() => {
                  setDailyStartDate("")
                  setDailyEndDate("")
                  setDailyPage(1)
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[11px] hover:bg-slate-200 cursor-pointer"
              >
                All Dates (Full File)
              </button>
            </div>
          </div>

          {/* Daily Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Shift</th>
                    <th className="py-3 px-4">First In</th>
                    <th className="py-3 px-4">Last Out</th>
                    <th className="py-3 px-4 text-center">Punches</th>
                    <th className="py-3 px-4 text-right">Late</th>
                    <th className="py-3 px-4 text-right">Overtime</th>
                    <th className="py-3 px-4 text-center">Flags</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingDaily ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Loading paired punch records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : !dailyData?.items || dailyData.items.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <p className="font-medium text-slate-600">No daily records found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          No shifts match the date range and filters. Try clicking "August 2026" or "All Dates".
                        </p>
                      </td>
                    </tr>
                  ) : (
                    dailyData.items.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-700">{row.date}</td>
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-slate-900">{row.employeeName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{row.employeeCode}</div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-slate-600">{row.shiftName || "Standard"}</span>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">
                          {row.firstPunchIn ? row.firstPunchIn.substring(0, 5) : "--:--"}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">
                          {row.lastPunchOut ? row.lastPunchOut.substring(0, 5) : "--:--"}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono text-slate-500">
                          {row.totalPunches}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono">
                          {row.lateMinutes > 0 ? (
                            <span className="text-rose-600 font-bold">+{row.lateMinutes}m</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono">
                          {row.overtimeMinutes > 0 ? (
                            <span className="text-emerald-600 font-bold">+{row.overtimeMinutes}m</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {row.isNightShift && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Night
                              </span>
                            )}
                            {row.isWeekend && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                Rest
                              </span>
                            )}
                            {row.isHoliday && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                Holiday
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {row.hasException ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.isResolved
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-300"
                              }`}
                            >
                              {row.isResolved ? "Resolved" : "Exception"}
                            </span>
                          ) : (
                            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Pagination Footer */}
          {dailyData && dailyData.totalCount > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 text-xs text-slate-500">
              <div>
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {(dailyPage - 1) * dailyPageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-800">
                  {Math.min(dailyPage * dailyPageSize, dailyData.totalCount)}
                </span>{" "}
                of <span className="font-semibold text-slate-800">{dailyData.totalCount}</span> daily records
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span>Rows:</span>
                  <select
                    value={dailyPageSize}
                    onChange={(e) => {
                      setDailyPageSize(Number(e.target.value))
                      setDailyPage(1)
                    }}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-slate-800 font-mono text-xs bg-white"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDailyPage((p) => Math.max(1, p - 1))}
                    disabled={dailyPage <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="px-2 font-mono text-slate-700">
                    {dailyPage} / {Math.ceil(dailyData.totalCount / dailyPageSize) || 1}
                  </span>
                  <button
                    onClick={() =>
                      setDailyPage((p) =>
                        p < Math.ceil(dailyData.totalCount / dailyPageSize) ? p + 1 : p
                      )
                    }
                    disabled={dailyPage >= Math.ceil(dailyData.totalCount / dailyPageSize)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Exceptions Review Queue */}
      {activeTab === "exceptions" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-semibold">
                  Payroll Finalization Safety Gate Active ({monthYear})
                </p>
                <p className="text-amber-700">
                  Monthly payroll runs cannot be locked/approved while unresolved attendance exceptions remain.
                  Review the items below and provide missing check-out times or confirm attendance.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-200/80 text-amber-900">
                {exceptions.length} Total in {monthYear}
              </span>
            </div>
          </div>

          {/* Filter & Search Ribbon for Exceptions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => {
                  setExceptionFilterType("ALL")
                  setExceptionPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  exceptionFilterType === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Issues ({exceptionCounts.all})
              </button>
              <button
                type="button"
                onClick={() => {
                  setExceptionFilterType("SINGLE_PUNCH")
                  setExceptionPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  exceptionFilterType === "SINGLE_PUNCH"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                Single Punch Only ({exceptionCounts.singlePunch})
              </button>
              <button
                type="button"
                onClick={() => {
                  setExceptionFilterType("NIGHT")
                  setExceptionPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  exceptionFilterType === "NIGHT"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                }`}
              >
                Unscheduled Nights ({exceptionCounts.night})
              </button>
              <button
                type="button"
                onClick={() => {
                  setExceptionFilterType("OVERTIME")
                  setExceptionPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  exceptionFilterType === "OVERTIME"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                Extra OT ({exceptionCounts.overtime})
              </button>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee name or code..."
                value={exceptionSearch}
                onChange={(e) => {
                  setExceptionSearch(e.target.value)
                  setExceptionPage(1)
                }}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Exceptions Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Recorded Punch</th>
                    <th className="py-3 px-4">Issue Flagged</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingExceptions ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <span>Loading unresolved exceptions for {monthYear}...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredExceptions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-emerald-600">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                        <p className="font-bold text-sm">All Exceptions Resolved!</p>
                        <p className="text-xs text-slate-400 mt-1">
                          No pending punch errors matching your filters for {monthYear}.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedExceptions.map((ex) => (
                      <tr key={ex.dailyAttendanceId} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">{ex.date}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{ex.employeeName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {ex.employeeCode} {ex.departmentName && `· ${ex.departmentName}`}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {renderPunchDetails(ex)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ex.isSinglePunchMissing ||
                              ex.exceptionType === "SINGLE_PUNCH_MISSING"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : ex.exceptionType === "UNSCHEDULED_NIGHT_SHIFT"
                                ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {ex.isSinglePunchMissing ||
                            ex.exceptionType === "SINGLE_PUNCH_MISSING"
                              ? "Single Punch Only"
                              : ex.exceptionType === "UNSCHEDULED_NIGHT_SHIFT"
                              ? "Unscheduled Night Shift"
                              : ex.exceptionType || "Missing Punch"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedException(ex)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <span>Resolve</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exceptions Pagination */}
          {filteredExceptions.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 text-xs text-slate-500">
              <div>
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {(exceptionPage - 1) * exceptionPageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-800">
                  {Math.min(exceptionPage * exceptionPageSize, filteredExceptions.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-800">{filteredExceptions.length}</span> exceptions
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span>Rows:</span>
                  <select
                    value={exceptionPageSize}
                    onChange={(e) => {
                      setExceptionPageSize(Number(e.target.value))
                      setExceptionPage(1)
                    }}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-slate-800 font-mono text-xs bg-white"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExceptionPage((p) => Math.max(1, p - 1))}
                    disabled={exceptionPage <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="px-2 font-mono text-slate-700">
                    {exceptionPage} / {Math.ceil(filteredExceptions.length / exceptionPageSize) || 1}
                  </span>
                  <button
                    onClick={() =>
                      setExceptionPage((p) =>
                        p < Math.ceil(filteredExceptions.length / exceptionPageSize) ? p + 1 : p
                      )
                    }
                    disabled={exceptionPage >= Math.ceil(filteredExceptions.length / exceptionPageSize)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Duty Roster & Scheduling */}
      {activeTab === "duty-roster" && (
        <ShiftRosterTab monthYear={monthYear} />
      )}

      {/* Tab 5: Shift Schedules & Policies */}
      {activeTab === "shifts" && (
        <ShiftSchedulesTab departments={departments} />
      )}

      {/* Biometric Upload Modal */}
      <BiometricUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          refetch()
        }}
      />

      {/* Exception Resolution Modal */}
      <ResolveExceptionModal
        isOpen={Boolean(selectedException)}
        exception={selectedException}
        onClose={() => setSelectedException(null)}
      />

      {/* Bulk Exception Resolution Modal */}
      <BulkResolveModal
        isOpen={isBulkResolveModalOpen}
        onClose={() => setIsBulkResolveModalOpen(false)}
        monthYear={monthYear}
      />
    </div>
  )
}
