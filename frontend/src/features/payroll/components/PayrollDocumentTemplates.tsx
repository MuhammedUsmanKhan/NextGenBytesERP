import React from "react"
import { CompanyDocumentHeader, CompanyDocumentFooter } from "./CompanyDocumentHeader"
import { formatPKR, numberToWordsPKR } from "../utils/currencyUtils"
import type { PayrollRunDetailDto } from "@/types/payroll-run.types"

// ============================================================================
// TEMPLATE 1: PAYROLL REGISTER (DETAILED)
// Matches Reference Template 1: "Print Register (Payroll Register - Detailed)"
// ============================================================================
export const PayrollRegisterDetailedTemplate: React.FC<{
  detail: PayrollRunDetailDto
}> = ({ detail }) => {
  const { run, payslips } = detail
  const generatedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const totalBasic = payslips.reduce((acc, p) => acc + p.basicRate, 0)
  const totalDays = payslips.reduce((acc, p) => acc + p.daysPresent, 0)

  return (
    <div className="w-full bg-white text-slate-900 p-2 sm:p-6 text-xs max-w-5xl mx-auto">
      <CompanyDocumentHeader />

      {/* Title & Period */}
      <div className="text-center my-4">
        <h2 className="text-2xl font-black text-[#0e2a47] tracking-tight uppercase">
          Payroll Register
        </h2>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">
          Period: <span className="text-[#0e2a47] font-bold">{run.monthYear}</span>
        </p>
      </div>

      {/* Register Table */}
      <div className="border border-slate-300 rounded-sm overflow-hidden mb-6">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-[#0e2a47] text-white font-bold">
              <th className="py-2.5 px-3 text-center w-10 border-r border-[#1a3a5c]">#</th>
              <th className="py-2.5 px-3 border-r border-[#1a3a5c]">Employee</th>
              <th className="py-2.5 px-3 border-r border-[#1a3a5c]">Department</th>
              <th className="py-2.5 px-2 text-center border-r border-[#1a3a5c] w-14">Days</th>
              <th className="py-2.5 px-3 text-right border-r border-[#1a3a5c]">Basic Salary</th>
              <th className="py-2.5 px-3 text-right border-r border-[#1a3a5c]">Gross Pay</th>
              <th className="py-2.5 px-3 text-right border-r border-[#1a3a5c]">Deductions</th>
              <th className="py-2.5 px-3 text-right font-bold">Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {payslips.map((slip, idx) => (
              <tr key={slip.id} className="hover:bg-slate-50 avoid-break">
                <td className="py-2 px-3 text-center font-mono text-[10px] text-slate-500 border-r border-slate-200">
                  {idx + 1}
                </td>
                <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900">
                  <div>{slip.employeeName}</div>
                  <span className="text-[9px] font-mono text-slate-400 font-normal">
                    {slip.employeeCode}
                  </span>
                </td>
                <td className="py-2 px-3 border-r border-slate-200 text-slate-600">
                  {slip.departmentName || "General"}
                </td>
                <td className="py-2 px-2 text-center font-mono border-r border-slate-200">
                  {slip.daysPresent}
                </td>
                <td className="py-2 px-3 text-right font-mono border-r border-slate-200 text-slate-800">
                  {slip.basicRate.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right font-mono border-r border-slate-200 text-slate-800">
                  {slip.grossSalary.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right font-mono border-r border-slate-200 text-rose-700">
                  {slip.totalDeductions > 0 ? slip.totalDeductions.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0"}
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-[#0e2a47]">
                  {slip.netSalary.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold border-t-2 border-[#0e2a47] text-slate-900 text-xs">
              <td colSpan={3} className="py-2.5 px-3 uppercase text-right border-r border-slate-300">
                Total
              </td>
              <td className="py-2.5 px-2 text-center font-mono border-r border-slate-300">
                {totalDays}
              </td>
              <td className="py-2.5 px-3 text-right font-mono border-r border-slate-300">
                {totalBasic.toLocaleString()}
              </td>
              <td className="py-2.5 px-3 text-right font-mono border-r border-slate-300">
                {run.totalGrossSalary.toLocaleString()}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-rose-700 border-r border-slate-300">
                {Math.round(run.totalDeductions).toLocaleString()}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-sm text-[#0e2a47] font-black">
                {run.totalNetSalary.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <CompanyDocumentFooter generatedDate={generatedDate} />
    </div>
  )
}

// ============================================================================
// TEMPLATE 2: EMPLOYEE BANK PAYMENT SLIP
// Matches Reference Template 2: "Bank Slip (Employee Bank Payment Slip)"
// ============================================================================
export const BankPaymentSlipTemplate: React.FC<{
  detail: PayrollRunDetailDto
  selectedEmployeeId?: string
}> = ({ detail, selectedEmployeeId }) => {
  const { run, payslips } = detail
  const slip =
    payslips.find((p) => p.employeeId === selectedEmployeeId) || payslips[0]

  if (!slip) return null

  const generatedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="w-full bg-white text-slate-900 p-2 sm:p-6 text-xs max-w-2xl mx-auto">
      <CompanyDocumentHeader />

      {/* Solid Deep Navy Banner */}
      <div className="my-5">
        <div className="bg-[#0e2a47] text-white text-center font-bold text-sm sm:text-base py-2.5 rounded-md uppercase tracking-wider shadow-xs">
          Bank Payment Slip
        </div>
      </div>

      {/* Employee & Bank Info Table */}
      <div className="border border-slate-300 rounded-md overflow-hidden mb-6">
        <table className="w-full text-left text-xs divide-y divide-slate-200">
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3 bg-slate-50 border-r border-slate-200">
                Employee Name:
              </td>
              <td className="py-2.5 px-4 font-semibold text-slate-900">
                {slip.employeeName}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">
                Employee ID:
              </td>
              <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">
                {slip.employeeCode}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">
                Bank Name:
              </td>
              <td className="py-2.5 px-4 text-slate-800">
                Allied Bank / Designated Disbursement Branch
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">
                Account No:
              </td>
              <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">
                {`PK92-ALBL-${slip.employeeCode.replace(/\D/g, "").padStart(8, "0") || "1234-5678-9012"}`}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">
                Period:
              </td>
              <td className="py-2.5 px-4 font-semibold text-slate-900">
                {run.monthYear}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Financial Summary Card */}
      <div className="border border-slate-300 rounded-md overflow-hidden mb-6">
        <div className="divide-y divide-slate-200">
          <div className="flex justify-between items-center py-2.5 px-4 text-xs">
            <span className="font-semibold text-slate-700">Total Earnings</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              Rs. {slip.grossSalary.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5 px-4 text-xs">
            <span className="font-semibold text-slate-700">Total Deductions</span>
            <span className="font-mono font-bold text-rose-700 text-sm">
              Rs. {Math.round(slip.totalDeductions).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 bg-[#0e2a47] text-white font-bold">
            <span className="text-sm uppercase tracking-wide">Net Pay</span>
            <span className="font-mono font-black text-base text-white">
              Rs. {slip.netSalary.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Transfer Notice */}
      <div className="text-center py-4 text-xs text-slate-600 font-medium italic border border-dashed border-slate-200 rounded-md bg-slate-50 mb-6">
        "This amount has been transferred to your designated bank account."
      </div>

      <CompanyDocumentFooter generatedDate={generatedDate} />
    </div>
  )
}

// ============================================================================
// TEMPLATE 3: INDIVIDUAL PAYSLIP
// Matches Reference Template 3: "Payslips (Individual Payslip)"
// ============================================================================
export const IndividualPayslipTemplate: React.FC<{
  detail: PayrollRunDetailDto
  selectedEmployeeId?: string
}> = ({ detail, selectedEmployeeId }) => {
  const { run, payslips } = detail
  const slip =
    payslips.find((p) => p.employeeId === selectedEmployeeId) || payslips[0]

  if (!slip) return null

  const generatedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="w-full bg-white text-slate-900 p-2 sm:p-6 text-xs max-w-2xl mx-auto">
      <CompanyDocumentHeader />

      {/* Title */}
      <div className="text-center my-3">
        <h2 className="text-2xl font-black text-[#0e2a47] tracking-tight uppercase">
          Payslip
        </h2>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">
          {run.monthYear}
        </p>
      </div>

      {/* Light Blue Employee Information Box */}
      <div className="bg-[#f0f7ff] border border-[#d0e2ff] rounded-lg p-3.5 mb-5 text-xs text-slate-800">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-semibold text-slate-600 block text-[11px]">Employee Name:</span>
            <span className="font-bold text-slate-900 text-sm">{slip.employeeName}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-600 block text-[11px]">Employee ID:</span>
            <span className="font-mono font-bold text-slate-800">{slip.employeeCode}</span>
          </div>
          <div className="col-span-2 pt-1 border-t border-[#dce8fa]">
            <span className="font-semibold text-slate-600 text-[11px]">Department: </span>
            <span className="font-bold text-slate-800">{slip.departmentName || "General Staff"}</span>
          </div>
        </div>
      </div>

      {/* 1. Earnings Table (Solid Deep Navy Header) */}
      <div className="border border-slate-300 rounded-md overflow-hidden mb-5">
        <div className="bg-[#0e2a47] text-white font-bold text-xs py-2 px-3 flex justify-between items-center">
          <span>Earnings</span>
          <span className="text-[10px] font-mono text-slate-200">Amount</span>
        </div>
        <table className="w-full text-left text-xs divide-y divide-slate-200">
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-2 px-3 text-slate-700">Basic Salary</td>
              <td className="py-2 px-3 text-right font-mono text-slate-900">
                Rs. {slip.grossSalary.toLocaleString()}
              </td>
            </tr>
            {slip.nightShiftsCount > 0 && (
              <tr>
                <td className="py-2 px-3 text-slate-700">
                  Night Shift Allowance ({slip.nightShiftsCount} shifts)
                </td>
                <td className="py-2 px-3 text-right font-mono text-emerald-700 font-medium">
                  Rs. {slip.nightShiftAmount.toLocaleString()}
                </td>
              </tr>
            )}
            {slip.overtimeMinutes > 0 && (
              <tr>
                <td className="py-2 px-3 text-slate-700">
                  Overtime Pay ({slip.overtimeMinutes} mins)
                </td>
                <td className="py-2 px-3 text-right font-mono text-emerald-700 font-medium">
                  Rs. {slip.overtimeAmount.toLocaleString()}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold border-t border-slate-300 text-slate-900">
              <td className="py-2.5 px-3">Total Earnings</td>
              <td className="py-2.5 px-3 text-right font-mono text-sm">
                Rs. {slip.grossSalary.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 2. Deductions Table (Solid Deep Navy Header) */}
      <div className="border border-slate-300 rounded-md overflow-hidden mb-5">
        <div className="bg-[#0e2a47] text-white font-bold text-xs py-2 px-3 flex justify-between items-center">
          <span>Deductions</span>
          <span className="text-[10px] font-mono text-slate-200">Amount</span>
        </div>
        <table className="w-full text-left text-xs divide-y divide-slate-200">
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-2 px-3 text-slate-700">
                Absence Penalty ({slip.absentDays} days absent)
              </td>
              <td className="py-2 px-3 text-right font-mono text-rose-700">
                {slip.absentDeduction > 0 ? `Rs. ${Math.round(slip.absentDeduction).toLocaleString()}` : "Rs. 0"}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-slate-700">
                Late Penalty ({slip.lateMinutes} mins late)
              </td>
              <td className="py-2 px-3 text-right font-mono text-rose-700">
                {slip.lateDeduction > 0 ? `Rs. ${Math.round(slip.lateDeduction).toLocaleString()}` : "Rs. 0"}
              </td>
            </tr>
            {slip.advanceSalaryDeduction > 0 && (
              <tr>
                <td className="py-2 px-3 text-slate-700">Salary Advance Recovery</td>
                <td className="py-2 px-3 text-right font-mono text-amber-800">
                  Rs. {slip.advanceSalaryDeduction.toLocaleString()}
                </td>
              </tr>
            )}
            {slip.loanDeduction > 0 && (
              <tr>
                <td className="py-2 px-3 text-slate-700">Company Loan Installment</td>
                <td className="py-2 px-3 text-right font-mono text-amber-800">
                  Rs. {slip.loanDeduction.toLocaleString()}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold border-t border-slate-300 text-slate-900">
              <td className="py-2.5 px-3">Total Deductions</td>
              <td className="py-2.5 px-3 text-right font-mono text-sm text-rose-700">
                Rs. {Math.round(slip.totalDeductions).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 3. Solid Deep Navy Net Pay Callout */}
      <div className="bg-[#0e2a47] text-white font-bold py-3 px-4 rounded-lg flex justify-between items-center mb-6 shadow-xs">
        <span className="text-sm uppercase tracking-wide">Net Pay</span>
        <span className="font-mono font-black text-lg text-white">
          Rs. {slip.netSalary.toLocaleString()}
        </span>
      </div>

      <CompanyDocumentFooter generatedDate={generatedDate} />
    </div>
  )
}

// ============================================================================
// TEMPLATE 4: BANK CASH WITHDRAWAL (BULK DENOMINATIONS)
// ============================================================================
export const BankCashDenominationsTemplate: React.FC<{
  detail: PayrollRunDetailDto
}> = ({ detail }) => {
  const { run, totalDenominations } = detail
  const generatedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="w-full bg-white text-slate-900 p-2 sm:p-6 text-xs max-w-3xl mx-auto">
      <CompanyDocumentHeader />

      <div className="my-4">
        <div className="bg-[#0e2a47] text-white text-center font-bold text-sm sm:text-base py-2.5 rounded-md uppercase tracking-wider">
          Bank Cash Withdrawal & Denomination Requisition
        </div>
      </div>

      <div className="border border-slate-300 rounded-md p-3.5 bg-slate-50 mb-5 leading-relaxed text-xs">
        <p className="font-semibold text-slate-800">
          To: <span className="font-normal">The Branch Manager, Commercial Bank Branch</span>
        </p>
        <p className="text-slate-700 mt-1">
          Please disburse the sum of <span className="font-bold text-slate-900">{formatPKR(run.totalNetSalary)}</span> (<span className="font-bold italic">{numberToWordsPKR(run.totalNetSalary)}</span>) for the <span className="font-bold">{run.monthYear}</span> payroll in the required currency note denominations detailed below.
        </p>
      </div>

      <div className="border border-slate-300 rounded-md overflow-hidden mb-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0e2a47] text-white font-bold">
              <th className="py-2.5 px-3 border-r border-[#1a3a5c]">Denomination</th>
              <th className="py-2.5 px-3 text-center border-r border-[#1a3a5c]">Notes Count</th>
              <th className="py-2.5 px-3 text-right border-r border-[#1a3a5c]">Subtotal (PKR)</th>
              <th className="py-2.5 px-3 text-center w-36">Teller Check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {[
              { label: "Rs. 5,000", count: totalDenominations.note5000, value: 5000 },
              { label: "Rs. 1,000", count: totalDenominations.note1000, value: 1000 },
              { label: "Rs. 500", count: totalDenominations.note500, value: 500 },
              { label: "Rs. 100", count: totalDenominations.note100, value: 100 },
              { label: "Rs. 50", count: totalDenominations.note50, value: 50 },
              { label: "Rs. 20", count: totalDenominations.note20, value: 20 },
              { label: "Rs. 10", count: totalDenominations.note10, value: 10 },
            ].map((n, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-bold border-r border-slate-200">{n.label}</td>
                <td className="py-2 px-3 text-center font-bold text-sm border-r border-slate-200">{n.count}</td>
                <td className="py-2 px-3 text-right border-r border-slate-200">Rs. {(n.count * n.value).toLocaleString()}</td>
                <td className="py-2 px-3 text-center text-slate-400 font-sans">[  ] Verified</td>
              </tr>
            ))}
            {totalDenominations.coinsRemainder > 0 && (
              <tr>
                <td className="py-2 px-3 font-sans font-bold border-r border-slate-200">Coins</td>
                <td className="py-2 px-3 text-center font-bold text-sm border-r border-slate-200">{totalDenominations.coinsRemainder}</td>
                <td className="py-2 px-3 text-right border-r border-slate-200">Rs. {totalDenominations.coinsRemainder}</td>
                <td className="py-2 px-3 text-center text-slate-400 font-sans">[  ] Verified</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold border-t-2 border-[#0e2a47] text-slate-900">
              <td className="py-3 px-3 uppercase border-r border-slate-300">Total Requested</td>
              <td className="py-3 px-3 text-center font-mono text-sm border-r border-slate-300">
                {totalDenominations.note5000 +
                  totalDenominations.note1000 +
                  totalDenominations.note500 +
                  totalDenominations.note100 +
                  totalDenominations.note50 +
                  totalDenominations.note20 +
                  totalDenominations.note10}{" "}
                Notes
              </td>
              <td className="py-3 px-3 text-right font-mono text-base border-r border-slate-300 text-[#0e2a47] font-black">
                Rs. {run.totalNetSalary.toLocaleString()}
              </td>
              <td className="py-3 px-3 text-center font-sans text-[10px] text-slate-500">Official Stamp</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <CompanyDocumentFooter generatedDate={generatedDate} />
    </div>
  )
}

// ============================================================================
// TEMPLATE 5: ALL PAYSLIPS BATCH (PRINTABLE SEQUENCE)
// ============================================================================
export const AllPayslipsBatchTemplate: React.FC<{
  detail: PayrollRunDetailDto
}> = ({ detail }) => {
  return (
    <div className="w-full space-y-12">
      {detail.payslips.map((slip) => (
        <div key={slip.id} className="avoid-break page-break-after">
          <IndividualPayslipTemplate detail={detail} selectedEmployeeId={slip.employeeId} />
        </div>
      ))}
    </div>
  )
}
