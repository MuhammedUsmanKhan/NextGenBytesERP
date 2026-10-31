import React, { useState, useEffect } from "react"
import { X, Printer, User } from "lucide-react"
import {
  PayrollRegisterDetailedTemplate,
  BankPaymentSlipTemplate,
  IndividualPayslipTemplate,
  BankCashDenominationsTemplate,
  AllPayslipsBatchTemplate,
} from "./PayrollDocumentTemplates"
import type { PayrollDocumentType } from "./PayrollPrintDropdowns"
import type { PayrollRunDetailDto } from "@/types/payroll-run.types"

interface Props {
  isOpen: boolean
  onClose: () => void
  detail: PayrollRunDetailDto
  initialDocumentType?: PayrollDocumentType
}

export const PayrollPrintPreviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  detail,
  initialDocumentType = "register-detailed",
}) => {
  const [docType, setDocType] = useState<PayrollDocumentType>(initialDocumentType)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")

  // Sync initial document type when modal opens
  useEffect(() => {
    setDocType(initialDocumentType)
  }, [initialDocumentType])

  // Default to first employee in payslips
  useEffect(() => {
    if (detail.payslips.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(detail.payslips[0].employeeId)
    }
  }, [detail.payslips, selectedEmployeeId])

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const isIndividualDocument =
    docType === "bank-slip" || docType === "individual-payslip"

  const docTitleMap: Record<PayrollDocumentType, string> = {
    "register-detailed": "Payroll Register (Detailed)",
    "register-summary": "Payroll Register (Summary)",
    "attendance-register": "Attendance Register",
    "bank-slip": "Employee Bank Payment Slip",
    "bank-slips-batch": "Bank Payment Slips (Batch)",
    "bank-denominations": "Bank Cash Requisition (Denominations)",
    "individual-payslip": "Individual Payslip",
    "payslips-batch": "All Employee Payslips (Batch)",
  }

  return (
    <>
      {/* Print-Only Container: Rendered during window.print() */}
      <div className="printable-document hidden print:block bg-white text-slate-900 w-full">
        {docType === "register-detailed" && (
          <PayrollRegisterDetailedTemplate detail={detail} />
        )}
        {docType === "bank-slip" && (
          <BankPaymentSlipTemplate
            detail={detail}
            selectedEmployeeId={selectedEmployeeId}
          />
        )}
        {docType === "bank-denominations" && (
          <BankCashDenominationsTemplate detail={detail} />
        )}
        {docType === "individual-payslip" && (
          <IndividualPayslipTemplate
            detail={detail}
            selectedEmployeeId={selectedEmployeeId}
          />
        )}
        {docType === "payslips-batch" && (
          <AllPayslipsBatchTemplate detail={detail} />
        )}
      </div>

      {/* Screen View Preview Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:hidden">
        <div className="bg-white border border-slate-200 w-full max-w-5xl max-h-[96vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-[#0e2a47] text-white font-bold text-xs">
                {docTitleMap[docType]}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Period: <span className="font-bold text-slate-800">{detail.run.monthYear}</span>
              </span>
            </div>

            {/* Employee Selector for Individual Slips */}
            <div className="flex items-center gap-2">
              {isIndividualDocument && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="text-xs font-medium text-slate-800 bg-transparent focus:outline-none cursor-pointer max-w-[200px] truncate"
                  >
                    {detail.payslips.map((slip) => (
                      <option key={slip.employeeId} value={slip.employeeId}>
                        {slip.employeeName} ({slip.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Paper Canvas Preview Area */}
          <div className="flex-1 bg-slate-100/90 p-4 sm:p-8 overflow-y-auto">
            <div className="bg-white shadow-xl border border-slate-200 rounded-xl p-4 sm:p-8 max-w-4xl mx-auto transition-all">
              {docType === "register-detailed" && (
                <PayrollRegisterDetailedTemplate detail={detail} />
              )}
              {docType === "bank-slip" && (
                <BankPaymentSlipTemplate
                  detail={detail}
                  selectedEmployeeId={selectedEmployeeId}
                />
              )}
              {docType === "bank-denominations" && (
                <BankCashDenominationsTemplate detail={detail} />
              )}
              {docType === "individual-payslip" && (
                <IndividualPayslipTemplate
                  detail={detail}
                  selectedEmployeeId={selectedEmployeeId}
                />
              )}
              {docType === "payslips-batch" && (
                <AllPayslipsBatchTemplate detail={detail} />
              )}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Tip: In the browser print dialog, select <span className="font-semibold text-slate-700">"Save as PDF"</span> to export a high-resolution PDF file.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
