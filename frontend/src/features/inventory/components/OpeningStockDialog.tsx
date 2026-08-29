import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

const schema = z.object({
  productId: z.string().min(1, "Product is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  quantity: z.coerce.number().min(0.001, "Quantity must be greater than 0"),
  averageCost: z.coerce.number().min(0, "Unit cost must be 0 or greater"),
  transactionDate: z.string().min(1, "Date is required"),
  remarks: z.string().max(500).nullable().optional().default(""),
})

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  productId: "",
  warehouseId: "",
  quantity: 0,
  averageCost: 0,
  transactionDate: new Date().toISOString().slice(0, 10),
  remarks: "",
}

interface Props {
  open: boolean
  onClose: () => void
  products: { id: string; productCode: string; productName: string }[]
  warehouses: { id: string; code: string; name: string }[]
  onSubmit: (data: FormValues) => void
  isSubmitting: boolean
}

export function OpeningStockDialog({ open, onClose, products, warehouses, onSubmit, isSubmitting }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues,
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">New Opening Stock Entry</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold hover:bg-slate-100 p-1 rounded-lg text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product</label>
            <select
              {...form.register("productId")}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.productCode} - {p.productName}</option>
              ))}
            </select>
            {form.formState.errors.productId && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.productId.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Warehouse</label>
            <select
              {...form.register("warehouseId")}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            >
              <option value="">Select warehouse...</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
              ))}
            </select>
            {form.formState.errors.warehouseId && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.warehouseId.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Quantity</label>
              <input
                type="number"
                step="0.001"
                {...form.register("quantity")}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {form.formState.errors.quantity && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.quantity.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Unit Cost</label>
              <input
                type="number"
                step="0.01"
                {...form.register("averageCost")}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {form.formState.errors.averageCost && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.averageCost.message as string}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Transaction Date</label>
            <input
              type="date"
              {...form.register("transactionDate")}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {form.formState.errors.transactionDate && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.transactionDate.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Remarks</label>
            <input
              type="text"
              {...form.register("remarks")}
              placeholder="Optional notes..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Create Entry"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
