import { useState, useEffect } from "react"
import { X, User, Briefcase, CreditCard, ShieldCheck, Fingerprint, Clock, ChevronDown, ChevronUp, Sliders, Zap } from "lucide-react"
import { useShifts } from "../hooks/useShifts"
import {
  PayType,
  DisbursementType,
  AbsencePolicy,
  RoundingMode,
  type EmployeeDto,
  type CreateEmployeeRequest,
  type UpdateEmployeeRequest,
} from "@/types/employee.types"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: EmployeeDto | null
  departments: { id: string; name: string }[]
  isLoading?: boolean
}

export default function EmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  departments,
  isLoading,
}: Props) {
  // Profile state
  const [code, setCode] = useState("")
  const [fullName, setFullName] = useState("")
  const [cnic, setCnic] = useState("")
  const [phone, setPhone] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [designation, setDesignation] = useState("")
  const [biometricDeviceId, setBiometricDeviceId] = useState("")
  const [shiftDefinitionId, setShiftDefinitionId] = useState("")
  const [category, setCategory] = useState("Salaries Labor")
  const [status, setStatus] = useState<"Active" | "Inactive" | "Terminated">("Active")

  const { data: shifts = [] } = useShifts()

  // Contract state (for new employee)
  const [payType, setPayType] = useState<PayType>(PayType.Monthly)
  const [disbursementType, setDisbursementType] = useState<DisbursementType>(DisbursementType.Cash)
  const [basicRate, setBasicRate] = useState<number>(0)
  const [attendanceAllowance, setAttendanceAllowance] = useState<number>(0)
  const [otherAllowances, setOtherAllowances] = useState<number>(0)
  const [dailyShiftHours, setDailyShiftHours] = useState<number>(10)
  const [nightShiftMinutes, setNightShiftMinutes] = useState<number>(840)
  const [absencePolicy, setAbsencePolicy] = useState<AbsencePolicy>(
    AbsencePolicy.ThresholdGrace_DeductAllIfExceeded
  )
  const [graceAbsentDays, setGraceAbsentDays] = useState<number>(1)
  const [overtimeEligible, setOvertimeEligible] = useState<boolean>(true)
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(1.5)
  const [roundingMode, setRoundingMode] = useState<RoundingMode>(RoundingMode.Ceiling10)
  const [bankName, setBankName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [showAdvancedRules, setShowAdvancedRules] = useState(false)

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code)
      setFullName(initialData.fullName)
      setCnic(initialData.cnic || "")
      setPhone(initialData.phone || "")
      setDepartmentId(initialData.departmentId || "")
      setDesignation(initialData.designation || "")
      setBiometricDeviceId(initialData.biometricDeviceId || "")
      setShiftDefinitionId(initialData.shiftDefinitionId || "")
      setCategory(initialData.category)
      setStatus(initialData.status)
    } else {
      setCode("")
      setFullName("")
      setCnic("")
      setPhone("")
      setDepartmentId(departments[0]?.id || "")
      setDesignation("")
      setBiometricDeviceId("")
      setShiftDefinitionId("")
      setCategory("Salaries Labor")
      setStatus("Active")
      setPayType(PayType.Monthly)
      setDisbursementType(DisbursementType.Cash)
      setBasicRate(0)
      setAttendanceAllowance(0)
      setOtherAllowances(0)
      setDailyShiftHours(10)
      setNightShiftMinutes(840)
      setAbsencePolicy(AbsencePolicy.ThresholdGrace_DeductAllIfExceeded)
      setGraceAbsentDays(1)
      setOvertimeEligible(true)
      setOvertimeMultiplier(1.5)
      setRoundingMode(RoundingMode.Ceiling10)
      setBankName("")
      setBankAccountNumber("")
    }
  }, [initialData, departments, isOpen])

  // Smart presets when category changes
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat)
    if (newCat === "Office Staff") {
      setDailyShiftHours(9)
      setAbsencePolicy(AbsencePolicy.FirstDayFree_DeductRemaining)
      setPayType(PayType.Monthly)
    } else if (newCat === "Salaries Labor") {
      setDailyShiftHours(10)
      setAbsencePolicy(AbsencePolicy.ThresholdGrace_DeductAllIfExceeded)
      setPayType(PayType.Monthly)
    } else if (newCat === "Daily Wages") {
      setDailyShiftHours(10)
      setAbsencePolicy(AbsencePolicy.StandardFullDeduction)
      setPayType(PayType.DailyWage)
    }
  }

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (initialData) {
      const updateData: UpdateEmployeeRequest = {
        fullName,
        cnic: cnic || undefined,
        phone: phone || undefined,
        departmentId: departmentId || undefined,
        designation: designation || undefined,
        biometricDeviceId: biometricDeviceId || undefined,
        shiftDefinitionId: shiftDefinitionId || undefined,
        category,
        status,
      }
      onSubmit(updateData)
    } else {
      const createData: CreateEmployeeRequest = {
        code: code || undefined,
        fullName,
        cnic: cnic || undefined,
        phone: phone || undefined,
        departmentId: departmentId || undefined,
        designation: designation || undefined,
        biometricDeviceId: biometricDeviceId || undefined,
        shiftDefinitionId: shiftDefinitionId || undefined,
        category,
        status,
        createContract: basicRate > 0,
        payType,
        disbursementType,
        basicRate,
        attendanceAllowance,
        otherAllowances,
        monthlyDivisorDays: 30,
        dailyShiftHours,
        nightShiftMinutes,
        absencePolicy,
        graceAbsentDays,
        overtimeEligible,
        overtimeMultiplier,
        roundingMode,
        bankName: bankName || undefined,
        bankAccountNumber: bankAccountNumber || undefined,
      }
      onSubmit(createData)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {initialData ? "Edit Employee Profile" : "Add New Employee"}
            </h3>
            <p className="text-xs text-slate-500">
              {initialData
                ? "Update identity, designation, and department details."
                : "Register profile details and salary/wage contract terms."}
            </p>
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
          {/* Identity Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <User className="w-4 h-4" />
              <span>Identity & Department</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Employee Code {!initialData && <span className="text-slate-400 font-normal">(optional auto)</span>}
                </label>
                <input
                  type="text"
                  placeholder="e.g. EMP-001"
                  value={code}
                  disabled={Boolean(initialData)}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abdul Rasheed"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Salaries Labor">Salaries Labor (Monthly 10h)</option>
                  <option value="Daily Wages">Daily Wages (Daily Rate 10h)</option>
                  <option value="Office Staff">Office Staff (Monthly 9h)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">CNIC (National ID)</label>
                <input
                  type="text"
                  placeholder="e.g. 42201-XXXXXXX-X"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Designation / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Operator, Driver, Accountant"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Employment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-blue-600" />
                  <span>Biometric Device ID (Machine PIN)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 101 or 1"
                  value={biometricDeviceId}
                  onChange={(e) => setBiometricDeviceId(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <span className="text-[10px] text-slate-400">Maps punches from ZKTeco/biometric devices</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assigned Shift Schedule</span>
                </label>
                <select
                  value={shiftDefinitionId}
                  onChange={(e) => setShiftDefinitionId(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Default / Department Schedule</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.shiftStart?.substring(0, 5)} - {s.shiftEnd?.substring(0, 5)}{s.isOvernightShift ? " Night" : ""})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400">Overrides default schedule if selected</span>
              </div>
            </div>
          </div>

          {/* Contract Terms (Only when creating new employee) */}
          {!initialData && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                <Briefcase className="w-4 h-4" />
                <span>Salary / Wage Contract Terms</span>
              </div>

              {/* Core Compensation Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Pay Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(Number(e.target.value) as PayType)}
                    className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={PayType.Monthly}>Monthly Salary</option>
                    <option value={PayType.DailyWage}>Daily Wage Rate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {payType === PayType.Monthly ? "Basic Monthly (PKR)" : "Daily Wage Rate (PKR)"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 24000 or 700"
                    value={basicRate || ""}
                    onChange={(e) => setBasicRate(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Disbursement Mode</label>
                  <select
                    value={disbursementType}
                    onChange={(e) => setDisbursementType(Number(e.target.value) as DisbursementType)}
                    className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={DisbursementType.Cash}>Cash (Denomination Breakdown)</option>
                    <option value={DisbursementType.BankTransfer}>Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Attendance Allowance (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 1000"
                    value={attendanceAllowance || ""}
                    onChange={(e) => setAttendanceAllowance(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Active Policy Summary Pill */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-emerald-900">Applied Policy Blueprint: </span>
                    <span className="text-emerald-700 font-medium">{category}</span>
                    <span className="text-emerald-600 block sm:inline sm:ml-1 text-[11px]">
                      ({dailyShiftHours}h Day • {overtimeMultiplier}× Overtime • {absencePolicy === AbsencePolicy.FirstDayFree_DeductRemaining ? "1st Day Free Grace" : absencePolicy === AbsencePolicy.ThresholdGrace_DeductAllIfExceeded ? "1-Day Grace Threshold" : "Full Deductions"} • Ceiling 10)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdvancedRules(!showAdvancedRules)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-900 hover:underline cursor-pointer transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showAdvancedRules ? "Hide Custom Rules" : "Customize Rules"}</span>
                  {showAdvancedRules ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Collapsible Advanced Shift & Overtime Rules */}
              {showAdvancedRules && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Advanced Policy & Minute Divisor Overrides
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Shift Hours / Day</label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        step="0.5"
                        value={dailyShiftHours}
                        onChange={(e) => setDailyShiftHours(Number(e.target.value))}
                        className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      <span className="text-[10px] text-slate-400">Office: 9h (16,200m) | Labor: 10h (18,000m)</span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Overtime Rate Multiplier
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="3"
                        step="0.1"
                        value={overtimeMultiplier}
                        onChange={(e) => setOvertimeMultiplier(Number(e.target.value))}
                        className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono font-semibold"
                      />
                      <span className="text-[10px] text-slate-400">Standard: 1.5× | Flat: 1.0×</span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Rounding Rule</label>
                      <select
                        value={roundingMode}
                        onChange={(e) => setRoundingMode(Number(e.target.value) as RoundingMode)}
                        className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value={RoundingMode.Ceiling10}>Ceiling 10 (Spreadsheet Match)</option>
                        <option value={RoundingMode.Nearest10}>Nearest 10</option>
                        <option value={RoundingMode.None}>No Rounding</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Absence Policy</label>
                      <select
                        value={absencePolicy}
                        onChange={(e) => setAbsencePolicy(Number(e.target.value) as AbsencePolicy)}
                        className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value={AbsencePolicy.ThresholdGrace_DeductAllIfExceeded}>
                          Salaries Labor: 1 grace day; if &gt; 1, deduct all days
                        </option>
                        <option value={AbsencePolicy.FirstDayFree_DeductRemaining}>
                          Office Staff: 1st day free; deduct remaining days (Days - 1)
                        </option>
                        <option value={AbsencePolicy.StandardFullDeduction}>
                          Standard: Deduct every absent day (no grace)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bank Information (Optional) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <CreditCard className="w-4 h-4" />
              <span>Bank Details (Optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Meezan Bank, HBL"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Account Number / IBAN</label>
                <input
                  type="text"
                  placeholder="e.g. PK00MEZN00000000000000"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{initialData ? "Save Changes" : "Create Employee"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

