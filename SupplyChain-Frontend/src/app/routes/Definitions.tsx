import { useState, useEffect } from "react"
import { Search, PlusCircle, Edit2, Trash2, Loader2, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react"
import { useNotificationStore } from "@/stores/notification.store"
import {
  useDefinitionList,
  useCreateDefinition,
  useUpdateDefinition,
  useUpdateDefinitionStatus,
  useDeleteDefinition,
  useMainCategoryLookup,
} from "@/hooks"
import type { DefinitionTab, DefinitionDto, SubCategoryDto } from "@/types/definition.types"
import { DEFINITION_TABS } from "@/types/definition.types"

const PAGE_SIZE = 20

export default function Definitions() {
  const addNotification = useNotificationStore((s) => s.addNotification)
  const [activeSubTab, setActiveSubTab] = useState<DefinitionTab>("main-categories")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [inputCode, setInputCode] = useState("")
  const [inputName, setInputName] = useState("")
  const [inputStatus, setInputStatus] = useState<"Active" | "Inactive">("Active")
  const [inputExtra, setInputExtra] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setPage(1)
  }, [activeSubTab, debouncedSearch, statusFilter])

  const { data: pagedData, isLoading } = useDefinitionList(activeSubTab, {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  })
  const createMutation = useCreateDefinition(activeSubTab)
  const updateMutation = useUpdateDefinition(activeSubTab)
  const updateStatusMutation = useUpdateDefinitionStatus(activeSubTab)
  const deleteMutation = useDeleteDefinition(activeSubTab)

  const { data: mainCategoryLookup } = useMainCategoryLookup()

  const items = pagedData?.items ?? []
  const totalCount = pagedData?.totalCount ?? 0
  const totalPages = pagedData?.totalPages ?? 0
  const currentPage = pagedData?.page ?? 1

  const getPrefix = (tab: DefinitionTab) => {
    switch (tab) {
      case "main-categories": return "CAT"
      case "sub-categories": return "SUB"
      case "brands": return "BRD"
      case "warehouses": return "WH"
      case "product-groups": return "GRP"
      case "transporters": return "TRN"
    }
  }

  const handleOpenAddModal = () => {
    setEditingId(null)
    setInputName("")
    setInputExtra("")
    setInputStatus("Active")
    const prefix = getPrefix(activeSubTab)
    const nextNum = totalCount + 1
    const padded = String(nextNum).padStart(3, "0")
    setInputCode(`${prefix}-${padded}`)
    setIsAddModalOpen(true)
  }

  const handleOpenEditModal = (item: DefinitionDto) => {
    setEditingId(item.id)
    setInputCode(item.code)
    setInputName(item.name)
    setInputStatus(item.status)
    if ("mainCategoryId" in item) {
      setInputExtra(item.mainCategoryId)
    } else if ("location" in item && item.location) {
      setInputExtra(item.location)
    } else if ("contactNumber" in item && item.contactNumber) {
      setInputExtra(item.contactNumber)
    } else {
      setInputExtra("")
    }
    setIsAddModalOpen(true)
  }

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputName.trim() || !inputCode.trim()) return

    const baseData = { code: inputCode, name: inputName, status: inputStatus }

    if (editingId) {
      let data: unknown
      switch (activeSubTab) {
        case "sub-categories":
          data = { ...baseData, mainCategoryId: inputExtra || mainCategoryLookup?.[0]?.id || "" } as never
          break
        case "warehouses":
          data = { ...baseData, location: inputExtra || null } as never
          break
        case "transporters":
          data = { ...baseData, contactNumber: inputExtra || null } as never
          break
        default:
          data = baseData as never
      }
      updateMutation.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            setIsAddModalOpen(false)
            addNotification({ text: `Updated ${inputName}`, read: false, type: "info" })
          },
        }
      )
    } else {
      let data: unknown
      switch (activeSubTab) {
        case "sub-categories":
          data = { ...baseData, mainCategoryId: inputExtra || mainCategoryLookup?.[0]?.id || "" } as never
          break
        case "warehouses":
          data = { ...baseData, location: inputExtra || null } as never
          break
        case "transporters":
          data = { ...baseData, contactNumber: inputExtra || null } as never
          break
        default:
          data = baseData as never
      }
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsAddModalOpen(false)
          addNotification({ text: `Created ${inputName}`, read: false, type: "success" })
        },
      })
    }
  }

  const handleToggleStatus = (item: DefinitionDto) => {
    const newStatus = item.status === "Active" ? "Inactive" : "Active"
    updateStatusMutation.mutate(
      { id: item.id, status: newStatus },
      {
        onSuccess: () => {
          addNotification({ text: `"${item.name}" status changed to ${newStatus}`, read: false, type: "info" })
        },
      }
    )
  }

  const handleDeleteItem = (item: DefinitionDto) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return
    deleteMutation.mutate(item.id, {
      onSuccess: () => {
        addNotification({ text: `Deleted "${item.name}"`, read: false, type: "warning" })
      },
    })
  }

  const activeTabLabel = DEFINITION_TABS.find((t) => t.key === activeSubTab)?.label ?? ""

  const statusFilterOptions = [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ]

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span>
        <span>/</span>
        <span className="text-slate-800">Definitions & Setup</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Definitions & Setup</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage master data for your supply chain operations.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200/50 w-fit">
        {DEFINITION_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveSubTab(tab.key)
              setSearchQuery("")
              setDebouncedSearch("")
              setStatusFilter("")
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSubTab === tab.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTabLabel.toLowerCase()}s...`}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            >
              {statusFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add New {activeTabLabel}
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Name</th>
                  {activeSubTab === "sub-categories" && <th className="px-6 py-4">Main Category</th>}
                  {activeSubTab === "warehouses" && <th className="px-6 py-4">Location</th>}
                  {activeSubTab === "transporters" && <th className="px-6 py-4">Contact</th>}
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm text-slate-700 font-medium">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-slate-400 text-xs">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4.5 font-mono text-xs text-slate-500">{item.code}</td>
                      <td className="px-6 py-4.5 text-slate-900 font-semibold">{item.name}</td>
                      {activeSubTab === "sub-categories" && (
                        <td className="px-6 py-4.5 text-xs text-slate-500">
                          {"mainCategoryName" in item ? (item as SubCategoryDto).mainCategoryName : ""}
                        </td>
                      )}
                      {activeSubTab === "warehouses" && (
                        <td className="px-6 py-4.5 text-xs text-slate-500">
                          {"location" in item ? (item as any).location : ""}
                        </td>
                      )}
                      {activeSubTab === "transporters" && (
                        <td className="px-6 py-4.5 text-xs text-slate-500">
                          {"contactNumber" in item ? (item as any).contactNumber : ""}
                        </td>
                      )}
                      <td className="px-6 py-4.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            item.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            disabled={updateStatusMutation.isPending}
                            className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title={item.status === "Active" ? "Deactivate" : "Activate"}
                          >
                            {item.status === "Active" ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit definition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete definition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Showing {items.length} of {totalCount} records</span>
          <div className="flex items-center gap-3">
            {totalPages > 0 && (
              <span className="text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-slate-300">...</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        p === currentPage
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800">
                {editingId ? `Edit ${activeTabLabel}` : `Add New ${activeTabLabel}`}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold hover:bg-slate-100 p-1 rounded-lg text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Code ID (Unique)
                </label>
                <input
                  type="text"
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  disabled={!!editingId}
                  placeholder="e.g. CAT-005"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-75 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder={`Enter ${activeTabLabel.toLowerCase()} name`}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {activeSubTab === "sub-categories" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Main Category
                  </label>
                  <select
                    value={inputExtra}
                    onChange={(e) => setInputExtra(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select main category...</option>
                    {mainCategoryLookup?.map((mc) => (
                      <option key={mc.id} value={mc.id}>
                        {mc.code} - {mc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeSubTab === "warehouses" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={inputExtra}
                    onChange={(e) => setInputExtra(e.target.value)}
                    placeholder="e.g. London East"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              )}

              {activeSubTab === "transporters" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={inputExtra}
                    onChange={(e) => setInputExtra(e.target.value)}
                    placeholder="e.g. +44 20 1234 5678"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Default Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={inputStatus === "Active"}
                      onChange={() => setInputStatus("Active")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={inputStatus === "Inactive"}
                      onChange={() => setInputStatus("Inactive")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Inactive
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Saving...
                    </span>
                  ) : editingId ? (
                    "Save Changes"
                  ) : (
                    "Create Entry"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
