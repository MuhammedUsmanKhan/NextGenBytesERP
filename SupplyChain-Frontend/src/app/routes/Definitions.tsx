import { useState } from "react"
import { Search, PlusCircle, Edit2, Trash2 } from "lucide-react"
import { useNotificationStore } from "@/stores/notification.store"

type DefinitionTab = "Main Category" | "Sub Category" | "Brand" | "Warehouse" | "Product Group" | "Transporter"

interface DefinitionItem {
  code: string
  name: string
  status: "Active" | "Inactive"
}

const tabs: DefinitionTab[] = [
  "Main Category",
  "Sub Category",
  "Brand",
  "Warehouse",
  "Product Group",
  "Transporter",
]

const initialMasterData: Record<DefinitionTab, DefinitionItem[]> = {
  "Main Category": [
    { code: "CAT-001", name: "Electronics", status: "Active" },
    { code: "CAT-002", name: "Furniture", status: "Active" },
    { code: "CAT-003", name: "Office Supplies", status: "Inactive" },
    { code: "CAT-004", name: "Industrial Equipment", status: "Active" },
  ],
  "Sub Category": [
    { code: "SUB-001", name: "Laptops & Screens", status: "Active" },
    { code: "SUB-002", name: "Ergonomic Seating", status: "Active" },
    { code: "SUB-003", name: "Executive Desks", status: "Active" },
    { code: "SUB-004", name: "Pneumatic Valves", status: "Inactive" },
  ],
  Brand: [
    { code: "BRD-001", name: "NexusPrime", status: "Active" },
    { code: "BRD-002", name: "Steelcase", status: "Active" },
    { code: "BRD-003", name: "Logitech Enterprise", status: "Active" },
    { code: "BRD-004", name: "Bosch Tools", status: "Active" },
  ],
  Warehouse: [
    { code: "WH-001", name: "London East Depot", status: "Active" },
    { code: "WH-002", name: "Texas Central Hub", status: "Active" },
    { code: "WH-003", name: "Frankfurt Air Gate", status: "Inactive" },
    { code: "WH-004", name: "Singapore Shipping", status: "Active" },
  ],
  "Product Group": [
    { code: "GRP-001", name: "IT Infrastructure", status: "Active" },
    { code: "GRP-002", name: "Premium Comfort", status: "Active" },
    { code: "GRP-003", name: "Bulk Materials", status: "Active" },
  ],
  Transporter: [
    { code: "TRN-001", name: "DHL Air Logistics", status: "Active" },
    { code: "TRN-002", name: "FedEx Freight", status: "Active" },
    { code: "TRN-003", name: "Maersk Ocean", status: "Active" },
    { code: "TRN-004", name: "Schenker Rail", status: "Inactive" },
  ],
}

export default function Definitions() {
  const addNotification = useNotificationStore((s) => s.addNotification)
  const [activeSubTab, setActiveSubTab] = useState<DefinitionTab>("Main Category")
  const [searchQuery, setSearchQuery] = useState("")
  const [masterData, setMasterData] = useState(initialMasterData)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DefinitionItem | null>(null)
  const [inputName, setInputName] = useState("")
  const [inputCode, setInputCode] = useState("")
  const [inputStatus, setInputStatus] = useState<"Active" | "Inactive">("Active")

  const getPrefix = (tab: DefinitionTab) => {
    switch (tab) {
      case "Main Category": return "CAT"
      case "Sub Category": return "SUB"
      case "Brand": return "BRD"
      case "Warehouse": return "WH"
      case "Product Group": return "GRP"
      case "Transporter": return "TRN"
    }
  }

  const handleOpenAddModal = () => {
    setEditingItem(null)
    setInputName("")
    const prefix = getPrefix(activeSubTab)
    const existing = masterData[activeSubTab]
    const nextNum = existing.length + 1
    const padded = String(nextNum).padStart(3, "0")
    setInputCode(`${prefix}-${padded}`)
    setInputStatus("Active")
    setIsAddModalOpen(true)
  }

  const handleOpenEditModal = (item: DefinitionItem) => {
    setEditingItem(item)
    setInputName(item.name)
    setInputCode(item.code)
    setInputStatus(item.status)
    setIsAddModalOpen(true)
  }

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputName.trim() || !inputCode.trim()) return

    const updatedList = [...masterData[activeSubTab]]

    if (editingItem) {
      const idx = updatedList.findIndex((i) => i.code === editingItem.code)
      if (idx !== -1) {
        updatedList[idx] = { code: inputCode, name: inputName, status: inputStatus }
      }
      addNotification({
        text: `Updated ${activeSubTab} "${inputName}" (${inputCode})`,
        read: false,
        type: "info",
      })
    } else {
      updatedList.push({ code: inputCode, name: inputName, status: inputStatus })
      addNotification({
        text: `Created new ${activeSubTab} "${inputName}" (${inputCode})`,
        read: false,
        type: "success",
      })
    }

    setMasterData({ ...masterData, [activeSubTab]: updatedList })
    setIsAddModalOpen(false)
  }

  const handleDeleteItem = (code: string) => {
    if (!confirm(`Are you sure you want to delete this ${activeSubTab}?`)) return
    const updatedList = masterData[activeSubTab].filter((i) => i.code !== code)
    setMasterData({ ...masterData, [activeSubTab]: updatedList })
    addNotification({
      text: `Deleted item with code "${code}" from ${activeSubTab}.`,
      read: false,
      type: "warning",
    })
  }

  const toggleStatus = (code: string) => {
    const updatedList = masterData[activeSubTab].map((i) => {
      if (i.code === code) {
        return { ...i, status: i.status === "Active" ? "Inactive" : "Active" }
      }
      return i
    })
    setMasterData({ ...masterData, [activeSubTab]: updatedList })
  }

  const currentList = masterData[activeSubTab] || []
  const filteredList = currentList.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span>
        <span>/</span>
        <span className="text-slate-800">Definitions & Setup</span>
      </div>

      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Definitions & Setup</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage master data for your supply chain operations.
        </p>
      </div>

      {/* Navigation Sub-Tabs bar */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200/50 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveSubTab(tab)
              setSearchQuery("")
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSubTab === tab
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table and Filtering Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeSubTab.toLowerCase()}s...`}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add New {activeSubTab}
          </button>
        </div>

        {/* Entries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm text-slate-700 font-medium">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No active master records matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.code} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4.5 font-mono text-xs text-slate-500">{item.code}</td>
                    <td className="px-6 py-4.5 text-slate-900 font-semibold">{item.name}</td>
                    <td className="px-6 py-4.5">
                      <button
                        onClick={() => toggleStatus(item.code)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer hover:opacity-80 transition-opacity ${
                          item.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                        {item.status}
                      </button>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit definition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.code)}
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
        </div>

        {/* Footer Statistics */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Showing {filteredList.length} of {currentList.length} records</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>{" "}
            {currentList.filter((i) => i.status === "Active").length} Active Entries
          </span>
        </div>
      </div>

      {/* Add / Edit Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800">
                {editingItem ? `Edit ${activeSubTab}` : `Add New ${activeSubTab}`}
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
                  disabled={!!editingItem}
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
                  placeholder={`Enter ${activeSubTab.toLowerCase()} name`}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Default Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
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
                      value="Inactive"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
                >
                  {editingItem ? "Save Changes" : "Create Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
