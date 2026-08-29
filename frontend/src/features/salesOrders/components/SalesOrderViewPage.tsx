import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Edit2, Loader2 } from "lucide-react"
import { useGetSalesOrderById, useCloseSalesOrder } from "@/hooks"

export default function SalesOrderViewPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading } = useGetSalesOrderById(id ?? null)
  const closeMutation = useCloseSalesOrder()

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-6 select-none">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Home</span><span>/</span><span>Sales</span><span>/</span><span className="text-slate-800">View Sales Order</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
          Sales Order not found.
        </div>
      </div>
    )
  }

  const isOpen = order.status === "Open"

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span><span>/</span><span>Sales</span><span>/</span><span className="text-slate-800">{order.salesOrderNumber}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/sales")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 font-display">{order.salesOrderNumber}</h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${isOpen ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-100 text-slate-600 border-slate-200"}`}>{order.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOpen && (
            <>
              <button onClick={() => navigate(`/sales/sales-orders/${id}/edit`)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 cursor-pointer">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => { if (confirm(`Close sales order "${order.salesOrderNumber}"?`)) closeMutation.mutate(order.id, { onSuccess: () => navigate("/sales") }) }} disabled={closeMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50">
                {closeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                )}
                Close Order
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Order Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</label>
            <p className="text-xs font-semibold text-slate-900">{order.customerName}</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Order Date</label>
            <p className="text-xs font-semibold text-slate-900">{formatDate(order.orderDate)}</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer PO Number</label>
            <p className="text-xs font-semibold text-slate-900">{order.customerPurchaseOrderNumber ?? "—"}</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expected Delivery</label>
            <p className="text-xs font-semibold text-slate-900">{formatDate(order.expectedDeliveryDate)}</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Warehouse</label>
            <p className="text-xs font-semibold text-slate-900">{order.warehouseName ?? "—"}</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</label>
            <p className="text-xs font-semibold text-slate-900">{order.departmentName ?? "—"}</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cycle Shot</label>
            <p className="text-xs font-semibold text-slate-900">{order.cycleShot ?? "—"}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Remarks</label>
            <p className="text-xs font-semibold text-slate-900">{order.remarks ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Line Items</h2>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
              {order.items.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2 text-slate-400 font-mono">{index + 1}</td>
                  <td className="px-4 py-2 font-bold text-slate-900">{item.productName}</td>
                  <td className="px-4 py-2 text-slate-500">{item.description ?? "—"}</td>
                  <td className="px-4 py-2 font-mono">{item.quantity}</td>
                  <td className="px-4 py-2 font-mono">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatCurrency(item.lineAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Summary</h2>
        <div className="flex justify-end">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-slate-700">{formatCurrency(order.subTotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Discount</span>
              <span className="font-mono font-semibold text-slate-700">{formatCurrency(order.discountAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Tax</span>
              <span className="font-mono font-semibold text-slate-700">{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-bold text-slate-900">
              <span>Grand Total</span>
              <span className="font-mono">{formatCurrency(order.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Audit Trail</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold">Created: </span>
            <span className="text-slate-700 font-semibold">{formatDate(order.createdAt)} by {order.createdBy}</span>
          </div>
          {order.updatedAt && (
            <div>
              <span className="text-slate-400 font-semibold">Updated: </span>
              <span className="text-slate-700 font-semibold">{formatDate(order.updatedAt)} by {order.updatedBy}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
