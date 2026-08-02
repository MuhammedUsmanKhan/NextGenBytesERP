import { useState } from "react"
import { Search, Plus, Filter, Edit2, Trash2, X } from "lucide-react"
import { useNotificationStore } from "@/stores/notification.store"

interface PurchaseOrder {
  id: string
  supplier: string
  date: string
  amount: number
  itemsCount: number
  status: "Ordered" | "Received" | "Pending" | "Cancelled"
}

const initialPurchases: PurchaseOrder[] = [
  { id: "PO-2026-001", supplier: "Caterpillar Heavy Logistics", date: "2026-07-08", amount: 45000, itemsCount: 150, status: "Received" },
  { id: "PO-2026-002", supplier: "Tokyo Precision Foundries", date: "2026-07-12", amount: 12400, itemsCount: 8, status: "Ordered" },
  { id: "PO-2026-003", supplier: "Asiatic Raw Materials Co.", date: "2026-07-16", amount: 128100, itemsCount: 400, status: "Pending" },
]

export default function Purchases() {
  const addNotification = useNotificationStore((s) => s.addNotification)
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(initialPurchases)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  const [inputSupplier, setInputSupplier] = useState("")
  const [inputAmount, setInputAmount] = useState("")
  const [inputItemsCount, setInputItemsCount] = useState("")
  const [inputStatus, setInputStatus] = useState<PurchaseOrder["status"]>("Pending")

  const handleOpenAddModal = () => {
    setEditingOrder(null)
    setInputSupplier("")
    setInputAmount("")
    setInputItemsCount("1")
    setInputStatus("Pending")
    setIsAddModalOpen(true)
  }

  const handleOpenEditModal = (order: PurchaseOrder) => {
    setEditingOrder(order)
    setInputSupplier(order.supplier)
    setInputAmount(String(order.amount))
    setInputItemsCount(String(order.itemsCount))
    setInputStatus(order.status)
    setIsAddModalOpen(true)
  }

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputSupplier.trim() || !inputAmount.trim()) return

    const amt = parseFloat(inputAmount)
    const count = parseInt(inputItemsCount, 10)
    if (isNaN(amt) || isNaN(count)) return

    if (editingOrder) {
      setPurchases(
        purchases.map((p) =>
          p.id === editingOrder.id
            ? { ...p, supplier: inputSupplier, amount: amt, itemsCount: count, status: inputStatus }
            : p
        )
      )
      addNotification({
        text: `Updated Purchase Order "${editingOrder.id}" for supplier "${inputSupplier}"`,
        read: false,
        type: "info",
      })
    } else {
      const nextNum = purchases.length + 1
      const newId = `PO-2026-${String(nextNum).padStart(3, "0")}`
      const newOrder: PurchaseOrder = {
        id: newId,
        supplier: inputSupplier,
        date: new Date().toISOString().split("T")[0],
        amount: amt,
        itemsCount: count,
        status: inputStatus,
      }
      setPurchases([...purchases, newOrder])
      addNotification({
        text: `Created Purchase Order "${newId}" from supplier "${inputSupplier}" for $${amt.toLocaleString()}`,
        read: false,
        type: "success",
      })
    }

    setIsAddModalOpen(false)
  }

  const handleDeleteOrder = (id: string) => {
    if (!confirm(`Are you sure you want to delete Purchase Order ${id}?`)) return
    setPurchases(purchases.filter((p) => p.id !== id))
    addNotification({
      text: `Permanently removed Purchase Order "${id}" from ledgers.`,
      read: false,
      type: "warning",
    })
  }

  const filteredPurchases = purchases.filter((p) => {
    const matchSearch =
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === "All" || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const getStatusStyle = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "Received": return "bg-emerald-50 text-emerald-700 border-emerald-100"
      case "Ordered": return "bg-blue-50 text-blue-700 border-blue-100"
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-100"
      case "Cancelled": return "bg-rose-50 text-rose-700 border-rose-100"
    }
  }

  return (
    <div className="space-y-6 select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span>
        <span>/</span>
        <span className="text-slate-800">Purchases Ledger</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Purchases Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage incoming inventory, suppliers, and purchase orders.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Purchase Order
        </button>
      </div>

      {/* Filters / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by PO id or supplier name..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Ordered">Ordered</option>
              <option value="Received">Received</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="text-right text-xs font-bold text-slate-400 uppercase tracking-wide">
          Total Procurement Expenditures:{" "}
          <span className="text-sm font-extrabold text-blue-600 font-display">
            $
            {filteredPurchases
              .filter((p) => p.status !== "Cancelled")
              .reduce((sum, p) => sum + p.amount, 0)
              .toLocaleString()}
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Supplier / Vendor</th>
                <th className="px-6 py-4">Order Date</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Acquisition Cost</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No procurement orders matching your selection.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4.5 font-mono text-xs text-slate-500">{p.id}</td>
                    <td className="px-6 py-4.5 font-bold text-slate-900">{p.supplier}</td>
                    <td className="px-6 py-4.5 text-slate-500">{p.date}</td>
                    <td className="px-6 py-4.5 text-slate-600 font-mono">{p.itemsCount} units</td>
                    <td className="px-6 py-4.5 text-slate-900 font-bold">${p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusStyle(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit Purchase Order"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(p.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete PO"
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

        {/* Status bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Acquisitions: {filteredPurchases.filter((p) => p.status === "Received").length} received</span>
          <span>In-transit: {filteredPurchases.filter((p) => p.status === "Ordered").length} ordered</span>
        </div>
      </div>

      {/* ADD / EDIT PROCUREMENT ORDER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800">
                {editingOrder ? `Modify Purchase Order ${editingOrder.id}` : "Create New Purchase Order"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Supplier / Vendor Name
                </label>
                <input
                  type="text"
                  required
                  value={inputSupplier}
                  onChange={(e) => setInputSupplier(e.target.value)}
                  placeholder="e.g. Caterpillar Supplies Inc."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Acquisition Cost (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="e.g. 54000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Quantity (Units)
                  </label>
                  <input
                    type="number"
                    required
                    value={inputItemsCount}
                    onChange={(e) => setInputItemsCount(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Acquisition Status
                </label>
                <select
                  value={inputStatus}
                  onChange={(e) => setInputStatus(e.target.value as PurchaseOrder["status"])}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Ordered">Ordered</option>
                  <option value="Received">Received</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-100 transition-colors cursor-pointer"
                >
                  {editingOrder ? "Update Order" : "Save Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
