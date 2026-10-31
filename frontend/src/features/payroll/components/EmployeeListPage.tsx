import { useState, useEffect } from "react"
import {
  Search,
  PlusCircle,
  Users,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  Banknote,
} from "lucide-react"
import {
  useEmployeeList,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useAddContract,
} from "../hooks/useEmployees"
import { useDefinitionList } from "@/hooks"
import { PayType, AbsencePolicy, type EmployeeDto } from "@/types/employee.types"
import EmployeeModal from "./EmployeeModal"
import ContractModal from "./ContractModal"

const PAGE_SIZE = 15

export default function EmployeeListPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [category, setCategory] = useState<string>("")
  const [departmentId, setDepartmentId] = useState<string>("")
  const [page, setPage] = useState(1)

  // Modals state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDto | null>(null)
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const [contractEmployee, setContractEmployee] = useState<EmployeeDto | null>(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  // Queries
  const { data: pagedData, isLoading } = useEmployeeList({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    category: category || undefined,
    departmentId: departmentId || undefined,
  })

  const { data: deptData } = useDefinitionList("departments", { page: 1, pageSize: 100 })
  const departments = deptData?.items?.map((d: any) => ({ id: d.id, name: d.name })) || []

  // Mutations
  const createMutation = useCreateEmployee()
  const updateMutation = useUpdateEmployee()
  const deleteMutation = useDeleteEmployee()
  const addContractMutation = useAddContract()

  const employees = pagedData?.items || []
  const totalCount = pagedData?.totalCount || 0
  const totalPages = pagedData?.totalPages || 1

  const handleOpenCreate = () => {
    setEditingEmployee(null)
    setIsEmployeeModalOpen(true)
  }

  const handleOpenEdit = (emp: EmployeeDto) => {
    setEditingEmployee(emp)
    setIsEmployeeModalOpen(true)
  }

  const handleOpenContract = (emp: EmployeeDto) => {
    setContractEmployee(emp)
    setIsContractModalOpen(true)
  }

  const handleEmployeeSubmit = (data: any) => {
    if (editingEmployee) {
      updateMutation.mutate(
        { id: editingEmployee.id, data },
        { onSuccess: () => setIsEmployeeModalOpen(false) }
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setIsEmployeeModalOpen(false),
      })
    }
  }

  const handleContractSubmit = (data: any) => {
    if (contractEmployee) {
      addContractMutation.mutate(
        { employeeId: contractEmployee.id, data },
        { onSuccess: () => setIsContractModalOpen(false) }
      )
    }
  }

  const handleDelete = (emp: EmployeeDto) => {
    if (confirm(`Are you sure you want to remove ${emp.fullName} (${emp.code})?`)) {
      deleteMutation.mutate(emp.id)
    }
  }

  const getAbsencePolicyBadge = (policy?: AbsencePolicy) => {
    switch (policy) {
      case AbsencePolicy.FirstDayFree_DeductRemaining:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
            1st Free (Office)
          </span>
        )
      case AbsencePolicy.ThresholdGrace_DeductAllIfExceeded:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
            1 Grace (Labor)
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Standard
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600" />
            <span>Employees & Contracts</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage worker records, pay categories, shift hours, and client absence deduction policies.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-100 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All Categories", value: "" },
            { label: "Salaries Labor", value: "Salaries Labor" },
            { label: "Daily Wages", value: "Daily Wages" },
            { label: "Office Staff", value: "Office Staff" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setCategory(tab.value)
                setPage(1)
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                category === tab.value
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Department Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by employee name, code (e.g. EMP-001), or CNIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value)
                setPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Contract Rate</th>
                <th className="py-3.5 px-4">Shift / Policy</th>
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
                      <span>Loading employees...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No employees found</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing filters or add your first employee.</p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const contract = emp.activeContract
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{emp.code}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{emp.fullName}</div>
                        {emp.designation && <div className="text-[11px] text-slate-500">{emp.designation}</div>}
                        {emp.cnic && <div className="text-[10px] text-slate-400 font-mono">{emp.cnic}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {emp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{emp.departmentName || "—"}</td>
                      <td className="py-3 px-4">
                        {contract ? (
                          <div>
                            <span className="font-bold font-mono text-emerald-700">
                              PKR {contract.basicRate.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">
                              /{contract.payType === PayType.Monthly ? "mo" : "day"}
                            </span>
                            {contract.attendanceAllowance > 0 && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                +{contract.attendanceAllowance} allow
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No Active Contract</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {contract ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{contract.dailyShiftHours}h Shift</span>
                              <span className="text-slate-300">|</span>
                              <span>{contract.nightShiftMinutes}m Night</span>
                            </div>
                            {getAbsencePolicyBadge(contract.absencePolicy)}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            emp.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              emp.status === "Active" ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenContract(emp)}
                            title="Manage Contract / Salary"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                          >
                            <Banknote className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            title="Edit Profile"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp)}
                            title="Delete Employee"
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
              Showing {employees.length} of {totalCount} employees
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSubmit={handleEmployeeSubmit}
        initialData={editingEmployee}
        departments={departments}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        employee={contractEmployee}
        onSubmit={handleContractSubmit}
        isLoading={addContractMutation.isPending}
      />
    </div>
  )
}
