import { useState } from "react"
import { X, History } from "lucide-react"
import {
  PayType,
  DisbursementType,
  AbsencePolicy,
  RoundingMode,
  type EmployeeDto,
  type CreateContractRequest,
} from "@/types/employee.types"
import { useEmployeeContracts } from "../hooks/useEmployees"

interface Props {
  isOpen: boolean
  onClose: () => void
  employee: EmployeeDto | null
  onSubmit: (contractData: CreateContractRequest) => void
  isLoading?: boolean
}

export default function ContractModal({ isOpen, onClose, employee, onSubmit, isLoading }: Props) {
  const currentContract = employee?.activeContract

  const [payType, setPayType] = useState<PayType>(currentContract?.payType ?? PayType.Monthly)
  const [disbursementType, setDisbursementType] = useState<DisbursementType>(
    currentContract?.disbursementType ?? DisbursementType.Cash
  )
  const [basicRate, setBasicRate] = useState<number>(currentContract?.basicRate ?? 0)
  const [attendanceAllowance, setAttendanceAllowance] = useState<number>(
    currentContract?.attendanceAllowance ?? 0
  )
  const [dailyShiftHours, setDailyShiftHours] = useState<number>(currentContract?.dailyShiftHours ?? 10)
  const [nightShiftMinutes, setNightShiftMinutes] = useState<number>(
    currentContract?.nightShiftMinutes ?? 840
  )
  const [absencePolicy, setAbsencePolicy] = useState<AbsencePolicy>(
    currentContract?.absencePolicy ?? AbsencePolicy.ThresholdGrace_DeductAllIfExceeded
  )
  const [roundingMode, setRoundingMode] = useState<RoundingMode>(
    currentContract?.roundingMode ?? RoundingMode.Ceiling10
  )
  const [bankName, setBankName] = useState(currentContract?.bankName ?? "")
  const [bankAccountNumber, setBankAccountNumber] = useState(currentContract?.bankAccountNumber ?? "")

  const { data: contractHistory } = useEmployeeContracts(employee?.id ?? null)

  if (!isOpen || !employee) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const req: CreateContractRequest = {
      payType,
      disbursementType,
      basicRate,
      attendanceAllowance,
      monthlyDivisorDays: 30,
      dailyShiftHours,
      nightShiftMinutes,
      absencePolicy,
      graceAbsentDays: 1,
      overtimeEligible: true,
      overtimeMultiplier: 1.5,
      roundingMode,
      bankName: bankName || undefined,
      bankAccountNumber: bankAccountNumber || undefined,
    }
    onSubmit(req)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[90vh] flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Manage Contract Terms</h3>
            <p className="text-xs text-slate-500">
              Employee: <span className="font-semibold text-slate-700">{employee.fullName}</span> ({employee.code})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-900">
            <span className="font-bold">Notice:</span> Activating new terms will preserve previous contract history and immediately apply to upcoming payroll runs.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Pay Type</label>
              <select
                value={payType}
                onChange={(e) => setPayType(Number(e.target.value) as PayType)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value={PayType.Monthly}>Monthly Salary</option>
                <option value={PayType.DailyWage}>Daily Wage Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {payType === PayType.Monthly ? "Basic Monthly Salary" : "Daily Wage Rate"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={basicRate || ""}
                onChange={(e) => setBasicRate(Number(e.target.value))}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Disbursement Mode</label>
              <select
                value={disbursementType}
                onChange={(e) => setDisbursementType(Number(e.target.value) as DisbursementType)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value={DisbursementType.Cash}>Cash (With Denomination Breakdown)</option>
                <option value={DisbursementType.BankTransfer}>Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Attendance Allowance (PKR)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={attendanceAllowance || ""}
                onChange={(e) => setAttendanceAllowance(Number(e.target.value))}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Shift Hours / Day</label>
              <input
                type="number"
                min="1"
                max="24"
                step="0.5"
                value={dailyShiftHours}
                onChange={(e) => setDailyShiftHours(Number(e.target.value))}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Night Shift Duration</label>
              <select
                value={nightShiftMinutes}
                onChange={(e) => setNightShiftMinutes(Number(e.target.value))}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value={840}>14 Hours (840 mins - Standard)</option>
                <option value={720}>12 Hours (720 mins - Special Labor)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Absence Policy</label>
              <select
                value={absencePolicy}
                onChange={(e) => setAbsencePolicy(Number(e.target.value) as AbsencePolicy)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Rounding Rule</label>
              <select
                value={roundingMode}
                onChange={(e) => setRoundingMode(Number(e.target.value) as RoundingMode)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value={RoundingMode.Ceiling10}>Ceiling 10 (Spreadsheet Match)</option>
                <option value={RoundingMode.Nearest10}>Nearest 10</option>
                <option value={RoundingMode.None}>No Rounding</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. Meezan Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Bank Account / IBAN</label>
              <input
                type="text"
                placeholder="Account number"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Past Contracts History */}
          {contractHistory && contractHistory.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <History className="w-4 h-4" />
                <span>Contract History ({contractHistory.length})</span>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {contractHistory.map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                      c.isActive ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-800">PKR {c.basicRate.toLocaleString()}</span>
                      <span className="ml-2 font-mono">
                        ({c.payType === PayType.Monthly ? "Monthly" : "Daily"})
                      </span>
                      {c.isActive && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(c.effectiveFrom).toLocaleDateString()}
                      {c.effectiveTo ? ` - ${new Date(c.effectiveTo).toLocaleDateString()}` : " - Present"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Saving..." : "Activate New Terms"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

