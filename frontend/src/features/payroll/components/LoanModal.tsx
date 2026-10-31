import { useState, useEffect } from "react"
import { X, ShieldCheck } from "lucide-react"
import { LoanType, LoanStatus, type LoanAndAdvanceDto, type CreateLoanRequest, type UpdateLoanRequest } from "@/types/loan.types"
import { useEmployeeList } from "../hooks/useEmployees"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: LoanAndAdvanceDto | null
  isLoading?: boolean
}

export default function LoanModal({ isOpen, onClose, onSubmit, initialData, isLoading }: Props) {
  const [employeeId, setEmployeeId] = useState("")
  const [type, setType] = useState<LoanType>(LoanType.SalaryAdvance)
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [monthlyDeduction, setMonthlyDeduction] = useState<number>(0)
  const [remainingBalance, setRemainingBalance] = useState<number>(0)
  const [disbursedDate, setDisbursedDate] = useState("")
  const [status, setStatus] = useState<LoanStatus>(LoanStatus.Active)
  const [notes, setNotes] = useState("")

  const { data: employeesData } = useEmployeeList({ page: 1, pageSize: 200, status: "Active" })
  const employees = employeesData?.items || []

  useEffect(() => {
    if (initialData) {
      setEmployeeId(initialData.employeeId)
      setType(initialData.type)
      setTotalAmount(initialData.totalAmount)
      setMonthlyDeduction(initialData.monthlyDeduction)
      setRemainingBalance(initialData.remainingBalance)
      setDisbursedDate(initialData.disbursedDate ? initialData.disbursedDate.split("T")[0] : "")
      setStatus(initialData.status)
      setNotes(initialData.notes || "")
    } else {
      setEmployeeId(employees[0]?.id || "")
      setType(LoanType.SalaryAdvance)
      setTotalAmount(0)
      setMonthlyDeduction(0)
      setRemainingBalance(0)
      setDisbursedDate(new Date().toISOString().split("T")[0])
      setStatus(LoanStatus.Active)
      setNotes("")
    }
  }, [initialData, employees, isOpen])

  const handleTypeChange = (newType: LoanType) => {
    setType(newType)
    if (newType === LoanType.SalaryAdvance && totalAmount > 0) {
      setMonthlyDeduction(totalAmount) // Advances default to full deduction
    }
  }

  const handleAmountChange = (amt: number) => {
    setTotalAmount(amt)
    if (type === LoanType.SalaryAdvance) {
      setMonthlyDeduction(amt)
    }
  }

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (initialData) {
      const updateReq: UpdateLoanRequest = {
        monthlyDeduction,
        remainingBalance,
        status,
        notes: notes || undefined,
      }
      onSubmit(updateReq)
    } else {
      const createReq: CreateLoanRequest = {
        employeeId,
        type,
        totalAmount,
        monthlyDeduction: monthlyDeduction > 0 ? monthlyDeduction : totalAmount,
        disbursedDate: disbursedDate || undefined,
        notes: notes || undefined,
      }
      onSubmit(createReq)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {initialData ? "Edit Loan / Advance Terms" : "Disburse Loan / Advance"}
            </h3>
            <p className="text-xs text-slate-500">
              {initialData
                ? "Update monthly installment deduction or adjust outstanding balance."
                : "Record an advance salary or installment loan for an employee."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {!initialData ? (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Employee <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.code}) - {emp.category}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">{initialData.employeeName}</span> ({initialData.employeeCode})
                <div className="text-[11px] text-slate-500">{initialData.category}</div>
              </div>
              <span className="font-mono text-xs font-bold text-slate-800">
                Total: PKR {initialData.totalAmount.toLocaleString()}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Disbursement Type</label>
              <select
                disabled={Boolean(initialData)}
                value={type}
                onChange={(e) => handleTypeChange(Number(e.target.value) as LoanType)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value={LoanType.SalaryAdvance}>Salary Advance (Short Term)</option>
                <option value={LoanType.Loan}>Term Loan (Installments)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Disbursed Date</label>
              <input
                type="date"
                disabled={Boolean(initialData)}
                value={disbursedDate}
                onChange={(e) => setDisbursedDate(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>

          {!initialData ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Total Disbursed Amount (PKR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="e.g. 15000"
                  value={totalAmount || ""}
                  onChange={(e) => handleAmountChange(Number(e.target.value))}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Monthly Deduction (PKR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="e.g. 5000"
                  value={monthlyDeduction || ""}
                  onChange={(e) => setMonthlyDeduction(Number(e.target.value))}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <span className="text-[10px] text-slate-400">
                  {type === LoanType.SalaryAdvance ? "Full deduction next payroll" : "Installment per run"}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Monthly Deduction</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={monthlyDeduction || ""}
                  onChange={(e) => setMonthlyDeduction(Number(e.target.value))}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Remaining Balance</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={remainingBalance ?? ""}
                  onChange={(e) => setRemainingBalance(Number(e.target.value))}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(Number(e.target.value) as LoanStatus)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value={LoanStatus.Active}>Active</option>
                  <option value={LoanStatus.Closed}>Closed</option>
                  <option value={LoanStatus.Suspended}>Suspended</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Purpose / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Medical emergency advance, Eid advance..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{initialData ? "Save Changes" : "Disburse"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

