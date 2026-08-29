import { Plus, Trash2 } from "lucide-react"
import { useGetProducts } from "@/hooks"
import type { CreateSalesOrderItemRequest } from "@/types/sales-order.types"

interface SalesOrderItemsTableProps {
  items: CreateSalesOrderItemRequest[]
  onChange: (items: CreateSalesOrderItemRequest[]) => void
  disabled?: boolean
}

export function SalesOrderItemsTable({ items, onChange, disabled }: SalesOrderItemsTableProps) {
  const { data: productsData } = useGetProducts({ pageSize: 100 })

  const products = productsData?.items ?? []

  const handleAddRow = () => {
    onChange([...items, { productId: "", description: "", quantity: 1, unitPrice: 0 }])
  }

  const handleRemoveRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const handleUpdateRow = (index: number, field: keyof CreateSalesOrderItemRequest, value: string | number) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item
      if (field === "quantity" || field === "unitPrice") {
        return { ...item, [field]: Number(value) || 0 }
      }
      return { ...item, [field]: value }
    })
    onChange(updated)
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    const updated = items.map((item, i) => {
      if (i !== index) return item
      return {
        ...item,
        productId,
        description: product?.productName ?? "",
        unitPrice: 0,
      }
    })
    onChange(updated)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

  const subTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-4 py-3 w-10">#</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 w-24">Qty</th>
              <th className="px-4 py-3 w-32">Unit Price</th>
              <th className="px-4 py-3 w-32 text-right">Amount</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No items added. Click "Add Item" below.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2 text-slate-400 font-mono">{index + 1}</td>
                  <td className="px-4 py-2">
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                      disabled={disabled}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:opacity-70"
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.productName}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.description ?? ""}
                      onChange={(e) => handleUpdateRow(index, "description", e.target.value)}
                      disabled={disabled}
                      placeholder="Description"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) => handleUpdateRow(index, "quantity", e.target.value)}
                      disabled={disabled}
                      min="0"
                      step="1"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={item.unitPrice || ""}
                      onChange={(e) => handleUpdateRow(index, "unitPrice", e.target.value)}
                      disabled={disabled}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70"
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-slate-500">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                  <td className="px-4 py-2">
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!disabled && (
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Item
        </button>
      )}

      <div className="flex justify-end">
        <div className="w-64 space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono font-semibold text-slate-700">{formatCurrency(subTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
