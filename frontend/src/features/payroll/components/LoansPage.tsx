import { useState, useMemo } from "react"
import {
  CreditCard,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  CheckCircle2,
} from "lucide-react"
import { useLoans, useCreateLoan, useUpdateLoan, useDeleteLoan } from "../hooks/useLoans"
import { LoanType, LoanStatus, type LoanAndAdvanceDto } from "@/types/loan.types"
import LoanModal from "./LoanModal"

const PAGE_SIZE = 15

export default function LoansPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<LoanType | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<LoanStatus | undefined>(undefined)
  const [search, setSearch] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState<LoanAndAdvanceDto | null>(null)

  const { data: pagedData, isLoading } = useLoans({
    page,
    pageSize: PAGE_SIZE,
    type: typeFilter,
    status: statusFilter,
  })

  const createMutation = useCreateLoan()
  const updateMutation = useUpdateLoan()
  const deleteMutation = useDeleteLoan()

  const allItems = pagedData?.items || []
  const totalCount = pagedData?.totalCount || 0
  const totalPages = pagedData?.totalPages || 1

  // Filter client-side for search query
  const filteredItems = useMemo(() => {
    if (!search.trim()) return allItems
    const s = search.toLowerCase()
    return allItems.filter(
      (item) =>
        item.employeeName.toLowerCase().includes(s) ||
        item.employeeCode.toLowerCase().includes(s) ||
        (item.notes && item.notes.toLowerCase().includes(s))
    )
  }, [allItems, search])

  // Summary Metrics
  const stats = useMemo(() => {
    return {
      totalActive: allItems.filter((i) => i.status === LoanStatus.Active).length,
      totalOutstanding: allItems
        .filter((i) => i.status === LoanStatus.Active)
        .reduce((acc, i) => acc + i.remainingBalance, 0),
      totalRepaid: allItems.reduce((acc, i) => acc + i.repaidAmount, 0),
    }
  }, [allItems])

  const handleOpenCreate = () => {
    setEditingLoan(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (loan: LoanAndAdvanceDto) => {
    setEditingLoan(loan)
    setIsModalOpen(true)
  }

  const handleSubmit = (data: any) => {
    if (editingLoan) {
      updateMutation.mutate(
        { id: editingLoan.id, data },
        { onSuccess: () => setIsModalOpen(false) }
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setIsModalOpen(false),
      })
    }
  }

  const handleDelete = (loan: LoanAndAdvanceDto) => {
    if (
      confirm(
        `Are you sure you want to delete this ${loan.type === LoanType.SalaryAdvance ? "advance" : "loan"} record for ${loan.employeeName}?`
      )
    ) {
      deleteMutation.mutate(loan.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-blue-600" />
            <span>Advances & Loans Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Disburse salary advances, manage term loan schedules, and track monthly payroll deductions.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-100 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Disburse Loan / Advance</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Active Disbursals</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{stats.totalActive}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <TrendingDown className="w-4 h-4 text-amber-500" />
            <span>Total Outstanding Principal</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">
            PKR {stats.totalOutstanding.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Total Repaid to Date</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            PKR {stats.totalRepaid.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { label: "All Records", type: undefined, status: undefined },
              { label: "Salary Advances", type: LoanType.SalaryAdvance, status: undefined },
              { label: "Term Loans", type: LoanType.Loan, status: undefined },
              { label: "Active Only", type: undefined, status: LoanStatus.Active },
              { label: "Closed", type: undefined, status: LoanStatus.Closed },
            ].map((tab, idx) => {
              const isActive = typeFilter === tab.type && statusFilter === tab.status
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setTypeFilter(tab.type)
                    setStatusFilter(tab.status)
                    setPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="relative sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by worker name, code, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Worker</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Disbursed Date</th>
                <th className="py-3.5 px-4">Disbursed Amount</th>
                <th className="py-3.5 px-4">Monthly Deduction</th>
                <th className="py-3.5 px-4 min-w-[160px]">Remaining Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No advances or loans found</p>
                    <p className="text-xs text-slate-400 mt-1">Disburse your first advance or loan above.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((loan) => {
                  const percentRepaid =
                    loan.totalAmount > 0
                      ? Math.min(100, Math.round((loan.repaidAmount / loan.totalAmount) * 100))
                      : 0

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{loan.employeeName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{loan.employeeCode}</div>
                        {loan.notes && <div className="text-[10px] text-slate-500 italic mt-0.5">{loan.notes}</div>}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            loan.type === LoanType.SalaryAdvance
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {loan.type === LoanType.SalaryAdvance ? "Salary Advance" : "Term Loan"}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {new Date(loan.disbursedDate).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        PKR {loan.totalAmount.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-rose-600">
                        PKR {loan.monthlyDeduction.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="font-bold text-slate-800">
                            PKR {loan.remainingBalance.toLocaleString()}
                          </span>
                          <span className="text-slate-400 text-[10px]">{percentRepaid}% repaid</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percentRepaid >= 100 ? "bg-emerald-500" : "bg-blue-600"
                            }`}
                            style={{ width: `${percentRepaid}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            loan.status === LoanStatus.Active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : loan.status === LoanStatus.Closed
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {loan.status === LoanStatus.Active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          {loan.status === LoanStatus.Active
                            ? "Active"
                            : loan.status === LoanStatus.Closed
                            ? "Closed"
                            : "Suspended"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(loan)}
                            title="Edit / Adjust Balance"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(loan)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Showing {filteredItems.length} of {totalCount} records
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <LoanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingLoan}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}

