import { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Coins,
  Building2,
  Download,
  AlertCircle,
} from "lucide-react";
import { usePayrollRuns, usePayrollRun } from "../hooks/usePayrollRuns";
import { PayrollPrintDropdowns, type PayrollDocumentType } from "./PayrollPrintDropdowns";
import { PayrollPrintPreviewModal } from "./PayrollPrintPreviewModal";

export default function PayrollReportsPage() {
  const currentMonthYear = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthYear);
  const [activeTab, setActiveTab] = useState<"summary" | "denominations" | "payslips">("summary");

  // Print Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<PayrollDocumentType>("register-detailed");

  const { data: runsData } = usePayrollRuns({
    pageSize: 100,
    monthYear: selectedMonth || undefined,
  });

  const latestRun = runsData?.items?.[0];
  const { data: runDetail, isLoading } = usePayrollRun(latestRun ? latestRun.id : null);

  // Group payslips by department / category for department summary
  const departmentSummaries = useMemo(() => {
    if (!runDetail || !runDetail.payslips) return [];

    const map = new Map<
      string,
      {
        deptName: string;
        employeeCount: number;
        dueSalaries: number;
        payableSalaries: number;
        loansAndAdvances: number;
      }
    >();

    for (const slip of runDetail.payslips) {
      const dept = slip.departmentName || "General Staff";
      const curr = map.get(dept) || {
        deptName: dept,
        employeeCount: 0,
        dueSalaries: 0,
        payableSalaries: 0,
        loansAndAdvances: 0,
      };

      curr.employeeCount += 1;
      curr.dueSalaries += slip.dueGrossSalaryRounded;
      curr.payableSalaries += slip.netSalary;
      curr.loansAndAdvances += slip.totalLess;
      map.set(dept, curr);
    }

    return Array.from(map.values());
  }, [runDetail]);

  const handleSelectPrintDoc = (docType: PayrollDocumentType) => {
    setSelectedPreviewDoc(docType);
    setIsPreviewModalOpen(true);
  };

  const handleExportCSV = () => {
    if (!runDetail || !runDetail.payslips.length) return;

    const headers = [
      "Employee Code",
      "Employee Name",
      "Department",
      "Basic Rate",
      "Gross Salary",
      "Absent Days",
      "Absent Deduction",
      "Late Minutes",
      "Late Deduction",
      "Night Shifts",
      "Night Amount",
      "Overtime Minutes",
      "Overtime Amount",
      "Due Gross Salary",
      "Due Gross Rounded",
      "Loan Deduction",
      "Advance Salary Deduction",
      "Total Deductions",
      "Net Salary",
      "Note 5000",
      "Note 1000",
      "Note 500",
      "Note 100",
      "Note 50",
      "Note 20",
      "Note 10",
      "Coins",
    ];

    const rows = runDetail.payslips.map((p) => [
      `"${p.employeeCode}"`,
      `"${p.employeeName}"`,
      `"${p.departmentName || "General"}"`,
      p.basicRate,
      p.grossSalary,
      p.absentDays,
      p.absentDeduction,
      p.lateMinutes,
      p.lateDeduction,
      p.nightShiftsCount,
      p.nightShiftAmount,
      p.overtimeMinutes,
      p.overtimeAmount,
      p.dueGrossSalary,
      p.dueGrossSalaryRounded,
      p.loanDeduction,
      p.advanceSalaryDeduction,
      p.totalDeductions,
      p.netSalary,
      p.denomination?.note5000 ?? 0,
      p.denomination?.note1000 ?? 0,
      p.denomination?.note500 ?? 0,
      p.denomination?.note100 ?? 0,
      p.denomination?.note50 ?? 0,
      p.denomination?.note20 ?? 0,
      p.denomination?.note10 ?? 0,
      p.denomination?.coinsRemainder ?? 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Payroll_Report_${runDetail.run.monthYear || selectedMonth}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Print Preview Modal */}
      {runDetail && (
        <PayrollPrintPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          detail={runDetail}
          initialDocumentType={selectedPreviewDoc}
        />
      )}

      {/* Screen View */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FileSpreadsheet className="h-7 w-7 text-blue-600" />
            Payroll Reports & Cash Denominations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Department-wise expense summaries, bank withdrawal requisition, and printable salary envelopes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleExportCSV}
            disabled={!runDetail}
            className="px-3.5 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center gap-1.5 disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export CSV
          </button>
          
          {/* Dropdown buttons: Print Register ⌵, Bank Slip ⌵, Payslips ⌵ */}
          <PayrollPrintDropdowns
            onSelectDocument={handleSelectPrintDoc}
            disabled={!runDetail}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 print:hidden">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "summary"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Department Expenses Summary
        </button>
        <button
          onClick={() => setActiveTab("denominations")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "denominations"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Bank Cash Withdrawal Requisition
        </button>
        <button
          onClick={() => setActiveTab("payslips")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "payslips"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Printable Salary Envelopes
        </button>
      </div>

      {!latestRun ? (
        <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 print:hidden">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No Payroll Run Found for {selectedMonth}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Please navigate to the Payroll Runs page to execute and calculate the run for this period first.
          </p>
        </div>
      ) : isLoading || !runDetail ? (
        <div className="p-12 text-center text-slate-400 print:hidden">
          Loading report calculations...
        </div>
      ) : (
        <div className="space-y-6 print:hidden">
          {/* TAB 1: Department Expenses Summary (Matches client's "SUMMRY FOR EXPENCES & SALARIES PAYABILS") */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-slate-900">
                      Department-wise Salary & Payable Summary ({runDetail.run.monthYear})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Matches Factory Payroll Expense Breakdown
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
                      <tr>
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Department / Category</th>
                        <th className="py-3 px-4 text-center">Staff Count</th>
                        <th className="py-3 px-4 text-right">Due Salaries (Rounded)</th>
                        <th className="py-3 px-4 text-right">Loans & Advances</th>
                        <th className="py-3 px-4 text-right font-bold">
                          Payable Salaries (Cash)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {departmentSummaries.map((dept, index) => (
                        <tr key={dept.deptName} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 text-slate-400 font-mono">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {dept.deptName}
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-slate-700">
                            {dept.employeeCount}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                            Rs. {dept.dueSalaries.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-amber-700 font-medium">
                            Rs. {dept.loansAndAdvances.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                            Rs. {dept.payableSalaries.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50/80 font-bold border-t-2 border-slate-200 text-slate-900">
                      <tr>
                        <td colSpan={2} className="py-3.5 px-4 uppercase text-xs">
                          Grand Total
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          {runDetail.run.employeeCount}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                          Rs. {runDetail.run.totalDueGrossRounded.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-amber-700">
                          Rs. {runDetail.run.totalLoansAndAdvances.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-700 text-base">
                          Rs. {runDetail.run.totalNetSalary.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Bank Cash Withdrawal Requisition Sheet */}
          {activeTab === "denominations" && (
            <div className="space-y-6">
              <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-xs p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <Coins className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Official Bank Cash Withdrawal Requisition
                      </h3>
                      <p className="text-xs text-slate-500">
                        Certified PKR currency denomination breakdown for bank teller branch withdrawal
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Net Withdrawal Amount</span>
                    <span className="text-xl font-extrabold font-mono text-emerald-700">
                      Rs. {runDetail.run.totalNetSalary.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
                      <tr>
                        <th className="py-3 px-4">Denomination</th>
                        <th className="py-3 px-4 text-center">Required Notes Count</th>
                        <th className="py-3 px-4 text-right">Subtotal Amount (PKR)</th>
                        <th className="py-3 px-4 text-center">Bank Verification Check</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">Rs. 5,000 Notes</td>
                        <td className="py-3 px-4 text-center font-bold text-lg text-slate-900">
                          {runDetail.totalDenominations.note5000}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">
                          Rs. {(runDetail.totalDenominations.note5000 * 5000).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-sans">[  ] Verified</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">Rs. 1,000 Notes</td>
                        <td className="py-3 px-4 text-center font-bold text-lg text-slate-900">
                          {runDetail.totalDenominations.note1000}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">
                          Rs. {(runDetail.totalDenominations.note1000 * 1000).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-sans">[  ] Verified</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">Rs. 500 Notes</td>
                        <td className="py-3 px-4 text-center font-bold text-lg text-slate-900">
                          {runDetail.totalDenominations.note500}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">
                          Rs. {(runDetail.totalDenominations.note500 * 500).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-sans">[  ] Verified</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">Rs. 100 Notes</td>
                        <td className="py-3 px-4 text-center font-bold text-lg text-slate-900">
                          {runDetail.totalDenominations.note100}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">
                          Rs. {(runDetail.totalDenominations.note100 * 100).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-sans">[  ] Verified</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">Rs. 50 Notes</td>
                        <td className="py-3 px-4 text-center font-bold text-lg text-slate-900">
                          {runDetail.totalDenominations.note50}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">
                          Rs. {(runDetail.totalDenominations.note50 * 50).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-sans">[  ] Verified</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">Rs. 20 Notes</td>
                        <td className="py-3 px-4 text-center font-bold text-lg text-slate-900">
                          {runDetail.totalDenominations.note20}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">
                          Rs. {(runDetail.totalDenominations.note20 * 20).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-sans">[  ] Verified</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">Rs. 10 Notes</td>
                        <td className="py-3 px-4 text-center font-bold text-lg text-slate-900">
                          {runDetail.totalDenominations.note10}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">
                          Rs. {(runDetail.totalDenominations.note10 * 10).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-sans">[  ] Verified</td>
                      </tr>
                      {runDetail.totalDenominations.coinsRemainder > 0 && (
                        <tr>
                          <td className="py-3 px-4 font-sans font-bold text-slate-900">Coins Remainder</td>
                          <td className="py-3 px-4 text-center font-bold text-lg text-slate-900">
                            {runDetail.totalDenominations.coinsRemainder}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-800">
                            Rs. {runDetail.totalDenominations.coinsRemainder}
                          </td>
                          <td className="py-3 px-4 text-center text-slate-400 font-sans">[  ] Verified</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50/80 font-bold border-t-2 border-slate-200 text-slate-900">
                      <tr>
                        <td className="py-3.5 px-4 uppercase text-xs">Total Bank Withdrawal Requisition</td>
                        <td className="py-3.5 px-4 text-center font-mono text-base">
                          {runDetail.totalDenominations.note5000 +
                            runDetail.totalDenominations.note1000 +
                            runDetail.totalDenominations.note500 +
                            runDetail.totalDenominations.note100 +
                            runDetail.totalDenominations.note50 +
                            runDetail.totalDenominations.note20 +
                            runDetail.totalDenominations.note10}{" "}
                          Notes
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-700 text-lg">
                          Rs. {runDetail.run.totalNetSalary.toLocaleString()}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="border-b border-slate-400 w-48 mx-auto mb-1.5 h-12"></div>
                    <span className="font-bold text-slate-900 block">Prepared By (Accountant)</span>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 w-48 mx-auto mb-1.5 h-12"></div>
                    <span className="font-bold text-slate-900 block">Authorized Signatory / Manager</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Printable Salary Envelopes with Thumb Impression / Signature Placeholder */}
          {activeTab === "payslips" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {runDetail.payslips.map((slip) => (
                <div
                  key={slip.id}
                  className="border border-slate-200/80 rounded-2xl bg-white p-4 space-y-3 shadow-xs"
                >
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-bold text-sm tracking-tight text-slate-900">
                        {slip.employeeName}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Code: {slip.employeeCode} • Dept: {slip.departmentName || "General"}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
                      {runDetail.run.monthYear}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Basic / Gross:</span>
                      <span className="font-mono font-medium text-slate-800">Rs. {slip.grossSalary.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Deductions (Late/Abs):</span>
                      <span className="font-mono font-medium text-rose-600">
                        {slip.totalDeductions > 0 ? `-Rs. ${slip.totalDeductions.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "0"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Due Gross (Rounded):</span>
                      <span className="font-mono font-medium text-slate-800">Rs. {slip.dueGrossSalaryRounded.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Loans / Advance Less:</span>
                      <span className="font-mono font-medium text-amber-700">
                        {slip.totalLess > 0 ? `-Rs. ${slip.totalLess.toLocaleString()}` : "0"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-800">
                      Net Cash Payable:
                    </span>
                    <span className="text-base font-extrabold font-mono text-emerald-700">
                      Rs. {slip.netSalary.toLocaleString()}
                    </span>
                  </div>

                  {slip.denomination && (
                    <div className="pt-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                        Cash Envelope Note Breakdown:
                      </span>
                      <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                        {slip.denomination.note5000 > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">5000: {slip.denomination.note5000}</span>
                        )}
                        {slip.denomination.note1000 > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">1000: {slip.denomination.note1000}</span>
                        )}
                        {slip.denomination.note500 > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">500: {slip.denomination.note500}</span>
                        )}
                        {slip.denomination.note100 > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">100: {slip.denomination.note100}</span>
                        )}
                        {slip.denomination.note50 > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">50: {slip.denomination.note50}</span>
                        )}
                        {slip.denomination.note20 > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">20: {slip.denomination.note20}</span>
                        )}
                        {slip.denomination.note10 > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">10: {slip.denomination.note10}</span>
                        )}
                        {slip.denomination.coinsRemainder > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">Coins: {slip.denomination.coinsRemainder}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-end text-[10px]">
                    <span className="text-slate-500">Received in full & final:</span>
                    <div className="text-center">
                      <div className="w-28 border-b border-slate-300 mb-0.5"></div>
                      <span className="text-slate-600 font-medium">Signature / Thumb</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}