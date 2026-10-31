import { useState, useMemo } from "react";
import {
  Calendar,
  Play,
  Search,
  Eye,
  CheckCircle2,
  Trash2,
  Clock,
  Coins,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";
import {
  usePayrollRuns,
  usePayrollRun,
  useCreateOrRecalculateRun,
  useApprovePayrollRun,
  useDeletePayrollRun,
} from "../hooks/usePayrollRuns";
import { PayrollRunStatus, type CreatePayrollRunRequest } from "@/types/payroll-run.types";
import { PayrollRunDetailModal } from "./PayrollRunDetailModal";
import { PayrollRunModal } from "./PayrollRunModal";

const PAGE_SIZE = 15;

export default function PayrollRunsPage() {
  const [page, setPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const { data: pagedData, isLoading } = usePayrollRuns({
    page,
    pageSize: PAGE_SIZE,
    monthYear: monthFilter || undefined,
  });

  const { data: selectedRunDetail } = usePayrollRun(selectedRunId);

  const createMutation = useCreateOrRecalculateRun();
  const approveMutation = useApprovePayrollRun();
  const deleteMutation = useDeletePayrollRun();

  const allItems = pagedData?.items || [];
  const totalCount = pagedData?.totalCount || 0;
  const totalPages = pagedData?.totalPages || 1;

  const filteredItems = useMemo(() => {
    if (!search.trim()) return allItems;
    const s = search.toLowerCase();
    return allItems.filter(
      (item) =>
        item.monthYear.toLowerCase().includes(s) ||
        (item.departmentCategory && item.departmentCategory.toLowerCase().includes(s)) ||
        (item.notes && item.notes.toLowerCase().includes(s))
    );
  }, [allItems, search]);

  const handleCreateRun = async (data: CreatePayrollRunRequest) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleApprove = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to approve this payroll run? This will lock calculations and deduct monthly loan & advance balances permanently."
      )
    ) {
      try {
        await approveMutation.mutateAsync({ id, allowOverride: false });
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || "";
        if (msg.includes("unresolved attendance exception") || msg.includes("supervisor override")) {
          if (
            window.confirm(
              `${msg}\n\nDo you want to proceed with an authorized SUPERVISOR OVERRIDE to approve and lock this payroll run anyway?`
            )
          ) {
            await approveMutation.mutateAsync({ id, allowOverride: true });
          }
        }
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this draft payroll run?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleRecalculate = async (monthYear: string, departmentCategory?: string) => {
    if (
      window.confirm(
        `Recalculate payroll for ${monthYear}? This will update formulas with current attendance and active contracts.`
      )
    ) {
      await createMutation.mutateAsync({ monthYear, departmentCategory });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Coins className="h-7 w-7 text-primary" />
            Payroll Calculation Engine & Runs
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Execute spreadsheet-accurate payroll runs, view PKR note denominations, and lock monthly disbursements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Play className="h-4 w-4" />
            Execute Payroll Run
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search month, category, or remarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
          />
          {monthFilter && (
            <button
              onClick={() => {
                setMonthFilter("");
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Payroll Runs Table */}
      <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Month / Period</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Employees</th>
                <th className="py-3 px-4 text-right">Total Gross</th>
                <th className="py-3 px-4 text-right">Due Gross (Round)</th>
                <th className="py-3 px-4 text-right">Loans/Adv</th>
                <th className="py-3 px-4 text-right font-bold">Net Salary</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    Loading payroll runs...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    No payroll runs found. Click "Execute Payroll Run" to generate one.
                  </td>
                </tr>
              ) : (
                filteredItems.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {run.monthYear}
                      </div>
                      <span className="text-xs text-slate-500 font-normal">
                        Run: {new Date(run.runDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {run.departmentCategory || "All Departments"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                      {run.employeeCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                      Rs. {run.totalGrossSalary.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800">
                      Rs. {run.totalDueGrossRounded.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-amber-700 font-medium">
                      Rs. {run.totalLoansAndAdvances.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                      Rs. {run.totalNetSalary.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {run.status === PayrollRunStatus.Approved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                          <Clock className="h-3.5 w-3.5" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRunId(run.id)}
                          title="View Payslips & Denominations"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {run.status === PayrollRunStatus.Draft && (
                          <>
                            <button
                              onClick={() => handleRecalculate(run.monthYear, run.departmentCategory)}
                              title="Recalculate Formulas"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <RotateCw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleApprove(run.id)}
                              title="Approve & Lock Run"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(run.id)}
                              title="Delete Draft Run"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filteredItems.length} of {totalCount} payroll runs
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-medium text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Execute Run Modal */}
      {isCreateModalOpen && (
        <PayrollRunModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateRun}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Run Detail Modal */}
      {selectedRunDetail && (
        <PayrollRunDetailModal
          detail={selectedRunDetail}
          onClose={() => setSelectedRunId(null)}
          onApprove={handleApprove}
          isApproving={approveMutation.isPending}
        />
      )}
    </div>
  );
}

