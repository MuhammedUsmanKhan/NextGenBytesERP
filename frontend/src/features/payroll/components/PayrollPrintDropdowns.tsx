import React, { useState, useRef, useEffect } from "react"
import {
  FileText,
  Landmark,
  Receipt,
  ChevronDown,
  FileSpreadsheet,
  Users,
  Coins,
} from "lucide-react"

export type PayrollDocumentType =
  | "register-detailed"
  | "register-summary"
  | "attendance-register"
  | "bank-slip"
  | "bank-slips-batch"
  | "bank-denominations"
  | "individual-payslip"
  | "payslips-batch"

interface Props {
  onSelectDocument: (docType: PayrollDocumentType) => void
  disabled?: boolean
}

export const PayrollPrintDropdowns: React.FC<Props> = ({
  onSelectDocument,
  disabled = false,
}) => {
  const [openDropdown, setOpenDropdown] = useState<"register" | "bank" | "payslip" | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const handleSelect = (docType: PayrollDocumentType) => {
    setOpenDropdown(null)
    onSelectDocument(docType)
  }

  return (
    <div ref={containerRef} className="flex items-center gap-2 print:hidden select-none">
      {/* =====================================================================
          BUTTON 1: PRINT REGISTER ⌵ (BLUE)
         ===================================================================== */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpenDropdown(openDropdown === "register" ? null : "register")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs border cursor-pointer ${
            openDropdown === "register"
              ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500/20"
              : "bg-blue-50/90 text-blue-700 hover:bg-blue-100/90 border-blue-200/80"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <FileText className={`w-4 h-4 ${openDropdown === "register" ? "text-white" : "text-blue-600"}`} />
          <span>Print Register</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${openDropdown === "register" ? "rotate-180" : ""}`} />
        </button>

        {openDropdown === "register" && (
          <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => handleSelect("register-detailed")}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Payroll Register (Detailed)</div>
                <div className="text-[10px] text-slate-400">Full staff list with days, deductions & net pay</div>
              </div>
            </button>
            <button
              onClick={() => handleSelect("register-summary")}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Payroll Register (Summary)</div>
                <div className="text-[10px] text-slate-400">Department expense breakdown summary</div>
              </div>
            </button>
            <button
              onClick={() => handleSelect("attendance-register")}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Attendance Register</div>
                <div className="text-[10px] text-slate-400">Monthly attendance, late & night shifts</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* =====================================================================
          BUTTON 2: BANK SLIP ⌵ (GREEN)
         ===================================================================== */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpenDropdown(openDropdown === "bank" ? null : "bank")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs border cursor-pointer ${
            openDropdown === "bank"
              ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/20"
              : "bg-emerald-50/90 text-emerald-700 hover:bg-emerald-100/90 border-emerald-200/80"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Landmark className={`w-4 h-4 ${openDropdown === "bank" ? "text-white" : "text-emerald-600"}`} />
          <span>Bank Slip</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${openDropdown === "bank" ? "rotate-180" : ""}`} />
        </button>

        {openDropdown === "bank" && (
          <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => handleSelect("bank-slip")}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Landmark className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Employee Bank Payment Slip</div>
                <div className="text-[10px] text-slate-400">Individual bank transfer advice slip</div>
              </div>
            </button>
            <button
              onClick={() => handleSelect("bank-denominations")}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Coins className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Bank Cash Requisition Slip</div>
                <div className="text-[10px] text-slate-400">Certified PKR currency notes breakdown</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* =====================================================================
          BUTTON 3: PAYSLIPS ⌵ (PURPLE)
         ===================================================================== */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpenDropdown(openDropdown === "payslip" ? null : "payslip")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs border cursor-pointer ${
            openDropdown === "payslip"
              ? "bg-purple-600 text-white border-purple-600 ring-2 ring-purple-500/20"
              : "bg-purple-50/90 text-purple-700 hover:bg-purple-100/90 border-purple-200/80"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Receipt className={`w-4 h-4 ${openDropdown === "payslip" ? "text-white" : "text-purple-600"}`} />
          <span>Payslips</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${openDropdown === "payslip" ? "rotate-180" : ""}`} />
        </button>

        {openDropdown === "payslip" && (
          <div className="absolute right-0 sm:left-0 mt-1.5 w-60 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => handleSelect("individual-payslip")}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Individual Payslip</div>
                <div className="text-[10px] text-slate-400">Two-section earnings & deductions voucher</div>
              </div>
            </button>
            <button
              onClick={() => handleSelect("payslips-batch")}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">All Employee Payslips (Batch)</div>
                <div className="text-[10px] text-slate-400">Print all staff salary envelopes</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
