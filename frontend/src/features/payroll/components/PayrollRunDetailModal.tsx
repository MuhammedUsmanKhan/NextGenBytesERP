import React, { useState } from "react";
import {
  X,
  Coins,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import type { PayrollRunDetailDto, PayslipDto } from "@/types/payroll-run.types";
import { PayrollRunStatus } from "@/types/payroll-run.types";

interface Props {
  detail: PayrollRunDetailDto;
  onClose: () => void;
  onApprove?: (id: string) => void;
  isApproving?: boolean;
}

export const PayrollRunDetailModal: React.FC<Props> = ({
  detail,
  onClose,
  onApprove,
  isApproving = false,
}) => {
  const { run, payslips, totalDenominations } = detail;
  const [expandedSlipId, setExpandedSlipId] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const departments = [
    "All",
    ...Array.from(new Set(payslips.map((p) => p.departmentName).filter(Boolean))),
  ];

  const filteredSlips = payslips.filter((slip) => {
    const matchesDept =
      filterDepartment === "All" || slip.departmentName === filterDepartment;
    const matchesSearch =
      !searchTerm ||
      slip.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedSlipId(expandedSlipId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Payroll Run: {run.monthYear}
                  </h2>
                  {run.status === PayrollRunStatus.Approved ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approved & Locked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                      <Clock className="h-3.5 w-3.5" />
                      Draft
                    </span>
                  )}
                  {run.departmentCategory && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {run.departmentCategory}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated for {run.employeeCount} employees • Created on{" "}
                  {new Date(run.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {run.status === PayrollRunStatus.Draft && onApprove && (
                <button
                  disabled={isApproving}
                  onClick={() => onApprove(run.id)}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isApproving ? "Approving..." : "Approve & Lock"}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Summary Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-xs">
                <span className="text-xs text-slate-500 font-medium block">
                  Total Gross
                </span>
                <span className="text-lg font-bold font-mono tracking-tight text-slate-900">
                  Rs. {run.totalGrossSalary.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-xs">
                <span className="text-xs text-slate-500 font-medium block">
                  Deductions (Late/Absent)
                </span>
                <span className="text-lg font-bold font-mono tracking-tight text-rose-600">
                  Rs. {run.totalDeductions.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-xs">
                <span className="text-xs text-slate-500 font-medium block">
                  Due Gross (Rounded)
                </span>
                <span className="text-lg font-bold font-mono tracking-tight text-slate-800">
                  Rs. {run.totalDueGrossRounded.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-xs">
                <span className="text-xs text-slate-500 font-medium block">
                  Loans & Advances
                </span>
                <span className="text-lg font-bold font-mono tracking-tight text-amber-700">
                  Rs. {run.totalLoansAndAdvances.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 shadow-xs col-span-2 md:col-span-1">
                <span className="text-xs text-emerald-800 font-semibold block">
                  Total Net Payable
                </span>
                <span className="text-xl font-extrabold font-mono tracking-tight text-emerald-700">
                  Rs. {run.totalNetSalary.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Cash Denominations Card */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Bank Cash Withdrawal Denominations (PKR Notes)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                    Total: Rs. {run.totalNetSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {[
                  { label: "Rs. 5,000", count: totalDenominations.note5000, value: 5000 },
                  { label: "Rs. 1,000", count: totalDenominations.note1000, value: 1000 },
                  { label: "Rs. 500", count: totalDenominations.note500, value: 500 },
                  { label: "Rs. 100", count: totalDenominations.note100, value: 100 },
                  { label: "Rs. 50", count: totalDenominations.note50, value: 50 },
                  { label: "Rs. 20", count: totalDenominations.note20, value: 20 },
                  { label: "Rs. 10", count: totalDenominations.note10, value: 10 },
                  { label: "Coins", count: totalDenominations.coinsRemainder, value: 1 },
                ].map((note, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-white text-center shadow-xs">
                    <span className="text-[11px] font-bold text-slate-600 block mb-0.5">
                      {note.label}
                    </span>
                    <span className="text-lg font-extrabold font-mono text-slate-900 block">
                      {note.count}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      = Rs. {(note.count * note.value).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search employee name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-800">{filteredSlips.length}</span> of {payslips.length} payslips
              </span>
            </div>

            {/* Payslips Table */}
            <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-8"></th>
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3 text-right">Basic/Gross</th>
                      <th className="py-2.5 px-3 text-right">Deductions</th>
                      <th className="py-2.5 px-3 text-right">Due Gross</th>
                      <th className="py-2.5 px-3 text-right">Due Gross (Round)</th>
                      <th className="py-2.5 px-3 text-right">Loans/Adv</th>
                      <th className="py-2.5 px-3 text-right font-bold">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSlips.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-slate-400">
                          No payslips found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredSlips.map((slip: PayslipDto) => {
                        const isExpanded = expandedSlipId === slip.id;
                        return (
                          <React.Fragment key={slip.id}>
                            <tr
                              onClick={() => toggleExpand(slip.id)}
                              className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                            >
                              <td className="py-2 px-3 text-slate-400">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </td>
                              <td className="py-2 px-3 font-medium text-slate-900">
                                <div>{slip.employeeName}</div>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {slip.employeeCode}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-600">
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-medium">
                                  {slip.departmentName || "General"}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-slate-800">
                                Rs. {slip.grossSalary.toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-rose-600 font-medium">
                                {slip.totalDeductions > 0
                                  ? `-Rs. ${slip.totalDeductions.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                                  : "0"}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-slate-500">
                                Rs. {slip.dueGrossSalary.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-medium text-slate-800">
                                Rs. {slip.dueGrossSalaryRounded.toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-amber-700 font-medium">
                                {slip.totalLess > 0
                                  ? `-Rs. ${slip.totalLess.toLocaleString()}`
                                  : "0"}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                                Rs. {slip.netSalary.toLocaleString()}
                              </td>
                            </tr>

                            {/* Expanded Breakdown */}
                            {isExpanded && (
                              <tr className="bg-slate-50/50">
                                <td colSpan={9} className="p-4 border-t border-slate-100">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    {/* Attendance details */}
                                    <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
                                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                                        Attendance & Shift Details
                                      </span>
                                      <div className="flex justify-between py-0.5 border-b border-slate-100">
                                        <span className="text-slate-500">Days Present:</span>
                                        <span className="font-mono text-slate-800">{slip.daysPresent}</span>
                                      </div>
                                      <div className="flex justify-between py-0.5 border-b border-slate-100">
                                        <span className="text-slate-500">Absent Days:</span>
                                        <span className="font-mono text-rose-600">
                                          {slip.absentDays} (Rs. {slip.absentDeduction.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                                        </span>
                                      </div>
                                      <div className="flex justify-between py-0.5 border-b border-slate-100">
                                        <span className="text-slate-500">Late Minutes:</span>
                                        <span className="font-mono text-rose-600">
                                          {slip.lateMinutes}m (Rs. {slip.lateDeduction.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                                        </span>
                                      </div>
                                      <div className="flex justify-between py-0.5 border-b border-slate-100">
                                        <span className="text-slate-500">Night Shifts:</span>
                                        <span className="font-mono text-emerald-700">
                                          {slip.nightShiftsCount} (+Rs. {slip.nightShiftAmount.toLocaleString()})
                                        </span>
                                      </div>
                                      <div className="flex justify-between py-0.5">
                                        <span className="text-slate-500">Overtime:</span>
                                        <span className="font-mono text-emerald-700">
                                          {slip.overtimeMinutes}m (+Rs. {slip.overtimeAmount.toLocaleString()})
                                        </span>
                                      </div>
                                    </div>

                                    {/* Deductions & Loan recoveries */}
                                    <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
                                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                        Loan & Advance Recoveries
                                      </span>
                                      <div className="flex justify-between py-0.5 border-b border-slate-100">
                                        <span className="text-slate-500">Salary Advance Deducted:</span>
                                        <span className="font-mono text-amber-700">
                                          Rs. {slip.advanceSalaryDeduction.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between py-0.5 border-b border-slate-100">
                                        <span className="text-slate-500">Company Loan Deducted:</span>
                                        <span className="font-mono text-amber-700">
                                          Rs. {slip.loanDeduction.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between py-0.5">
                                        <span className="font-semibold text-slate-900">Total Recoveries:</span>
                                        <span className="font-mono font-bold text-amber-700">
                                          Rs. {slip.totalLess.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Cash Denomination Breakdown */}
                                    <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
                                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                                        <Coins className="h-3.5 w-3.5 text-emerald-600" />
                                        Cash Envelope Breakdown
                                      </span>
                                      {slip.denomination ? (
                                        <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-mono text-[11px]">
                                          <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="text-[9px] text-slate-500 font-sans">5000</div>
                                            <div className="font-bold text-slate-900">{slip.denomination.note5000}</div>
                                          </div>
                                          <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="text-[9px] text-slate-500 font-sans">1000</div>
                                            <div className="font-bold text-slate-900">{slip.denomination.note1000}</div>
                                          </div>
                                          <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="text-[9px] text-slate-500 font-sans">500</div>
                                            <div className="font-bold text-slate-900">{slip.denomination.note500}</div>
                                          </div>
                                          <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="text-[9px] text-slate-500 font-sans">100</div>
                                            <div className="font-bold text-slate-900">{slip.denomination.note100}</div>
                                          </div>
                                          <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="text-[9px] text-slate-500 font-sans">50</div>
                                            <div className="font-bold text-slate-900">{slip.denomination.note50}</div>
                                          </div>
                                          <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="text-[9px] text-slate-500 font-sans">20</div>
                                            <div className="font-bold text-slate-900">{slip.denomination.note20}</div>
                                          </div>
                                          <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="text-[9px] text-slate-500 font-sans">10</div>
                                            <div className="font-bold text-slate-900">{slip.denomination.note10}</div>
                                          </div>
                                          <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="text-[9px] text-slate-500 font-sans">Coins</div>
                                            <div className="font-bold text-slate-900">{slip.denomination.coinsRemainder}</div>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-slate-400 text-xs">No denominations calculated.</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Review employee calculations and denominations before approving the payroll run. For printable registers, bank slips, and payslips, visit the Reports & Denominations tab.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
  );
};
