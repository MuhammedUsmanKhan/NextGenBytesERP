import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, useFieldArray, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react"
import { useGetSalesOrderById, useCreateSalesOrder, useUpdateSalesOrder, useGetProducts, useDefinitionList } from "@/hooks"
import type { CustomerDto, WarehouseDto, DepartmentDto } from "@/types/definition.types"

const schema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  orderDate: z.string().min(1, "Order date is required"),
  customerPurchaseOrderNumber: z.string().optional().nullable(),
  expectedDeliveryDate: z.string().optional().nullable(),
  warehouseId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  cycleShot: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  discountAmount: z.coerce.number().min(0).optional(),
  taxAmount: z.coerce.number().min(0).optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    description: z.string().optional().nullable(),
    quantity: z.coerce.number().min(1, "Qty must be > 0"),
    unitPrice: z.coerce.number().min(0, "Price must be >= 0"),
  })).min(1, "At least one item is required"),
})

type FormValues = z.infer<typeof schema>

export default function SalesOrderFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const { data: existingOrder, isLoading: isLoadingOrder } = useGetSalesOrderById(id ?? null)
  const createMutation = useCreateSalesOrder()
  const updateMutation = useUpdateSalesOrder()

  const { data: customersData } = useDefinitionList("customers", { pageSize: 100 })
  const { data: warehousesData } = useDefinitionList("warehouses", { pageSize: 100 })
  const { data: departmentsData } = useDefinitionList("departments", { pageSize: 100 })
  const { data: productsData } = useGetProducts({ pageSize: 100 })

  const customers = (customersData?.items ?? []) as unknown as CustomerDto[]
  const warehouses = (warehousesData?.items ?? []) as unknown as WarehouseDto[]
  const departments = (departmentsData?.items ?? []) as unknown as DepartmentDto[]
  const products = productsData?.items ?? []

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      customerId: "",
      orderDate: new Date().toISOString().split("T")[0],
      customerPurchaseOrderNumber: "",
      expectedDeliveryDate: "",
      warehouseId: "",
      departmentId: "",
      cycleShot: "",
      remarks: "",
      discountAmount: 0,
      taxAmount: 0,
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  useEffect(() => {
    if (existingOrder && isEdit) {
      reset({
        customerId: existingOrder.customerId,
        orderDate: existingOrder.orderDate.split("T")[0],
        customerPurchaseOrderNumber: existingOrder.customerPurchaseOrderNumber ?? "",
        expectedDeliveryDate: existingOrder.expectedDeliveryDate?.split("T")[0] ?? "",
        warehouseId: existingOrder.warehouseId ?? "",
        departmentId: existingOrder.departmentId ?? "",
        cycleShot: existingOrder.cycleShot ?? "",
        remarks: existingOrder.remarks ?? "",
        discountAmount: existingOrder.discountAmount,
        taxAmount: existingOrder.taxAmount,
        items: existingOrder.items.map((item) => ({
          productId: item.productId,
          description: item.description ?? "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      })
    }
  }, [existingOrder, isEdit, reset])

  const isClosed = existingOrder?.status === "Closed"
  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isDisabled = isClosed

  const watchedItems = watch("items")
  const subTotal = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const discount = watch("discountAmount") ?? 0
  const tax = watch("taxAmount") ?? 0
  const grandTotal = subTotal - discount + tax

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

  const getUnitShortName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product?.unitShortName ?? "—"
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    setValue(`items.${index}.productId`, productId)
    setValue(`items.${index}.description`, product?.productName ?? "")
    setValue(`items.${index}.unitPrice`, 0)
  }

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      customerPurchaseOrderNumber: data.customerPurchaseOrderNumber || null,
      expectedDeliveryDate: data.expectedDeliveryDate || null,
      warehouseId: data.warehouseId || null,
      departmentId: data.departmentId || null,
      cycleShot: data.cycleShot || null,
      remarks: data.remarks || null,
      discountAmount: data.discountAmount ?? 0,
      taxAmount: data.taxAmount ?? 0,
      items: data.items.map((item) => ({
        ...item,
        description: item.description || null,
      })),
    }

    if (isEdit && id) {
      updateMutation.mutate({ id, data: payload }, { onSuccess: () => navigate("/sales") })
    } else {
      createMutation.mutate(payload, { onSuccess: () => navigate("/sales") })
    }
  }

  if (isEdit && isLoadingOrder) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span><span>/</span><span>Sales</span><span>/</span><span className="text-slate-800">{isEdit ? "Edit Sales Order" : "Create Sales Order"}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/sales")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 font-display">{isEdit ? "Edit Sales Order" : "Create Sales Order"}</h1>
              {isClosed && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border bg-slate-100 text-slate-600 border-slate-200">Closed</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/sales")} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">Cancel</button>
          {!isDisabled && (
            <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {isEdit ? "Update" : "Save"}
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Order Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Customer *</label>
              <select {...register("customerId")} disabled={isDisabled} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:opacity-70">
                <option value="">Select customer...</option>
                {customers.map((c) => (<option key={c.id} value={c.id}>{c.companyName}</option>))}
              </select>
              {errors.customerId && <p className="text-xs text-red-500 mt-1">{errors.customerId.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Order Date *</label>
              <input type="date" {...register("orderDate")} disabled={isDisabled} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70" />
              {errors.orderDate && <p className="text-xs text-red-500 mt-1">{errors.orderDate.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Customer PO Number</label>
              <input type="text" {...register("customerPurchaseOrderNumber")} disabled={isDisabled} placeholder="PO Number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expected Delivery Date</label>
              <input type="date" {...register("expectedDeliveryDate")} disabled={isDisabled} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Warehouse</label>
              <select {...register("warehouseId")} disabled={isDisabled} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:opacity-70">
                <option value="">Select warehouse...</option>
                {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
              <select {...register("departmentId")} disabled={isDisabled} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:opacity-70">
                <option value="">Select department...</option>
                {departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cycle Shot</label>
              <input type="text" {...register("cycleShot")} disabled={isDisabled} placeholder="Cycle shot" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Remarks</label>
              <textarea {...register("remarks")} disabled={isDisabled} rows={2} placeholder="Remarks..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 resize-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Line Items *</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3 w-10">#</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 w-24">Qty</th>
                  <th className="px-4 py-3 w-32">Unit Price</th>
                  <th className="px-4 py-3 w-32 text-right">Amount</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">No items added. Click "Add Item" below.</td>
                  </tr>
                ) : (
                  fields.map((field, index) => (
                    <tr key={field.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-2 text-slate-400 font-mono">{index + 1}</td>
                      <td className="px-4 py-2">
                        <select
                          value={watch(`items.${index}.productId`)}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          disabled={isDisabled}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:opacity-70"
                        >
                          <option value="">Select product...</option>
                          {products.map((p) => (<option key={p.id} value={p.id}>{p.productName}</option>))}
                        </select>
                        {errors.items?.[index]?.productId && <p className="text-[10px] text-red-500 mt-0.5">{errors.items[index]?.productId?.message}</p>}
                      </td>
                      <td className="px-4 py-2 text-slate-500 font-mono text-xs">
                        {getUnitShortName(watch(`items.${index}.productId`))}
                      </td>
                      <td className="px-4 py-2">
                        <input type="text" {...register(`items.${index}.description`)} disabled={isDisabled} placeholder="Description" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" {...register(`items.${index}.quantity`)} disabled={isDisabled} min="1" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70" />
                        {errors.items?.[index]?.quantity && <p className="text-[10px] text-red-500 mt-0.5">{errors.items[index]?.quantity?.message}</p>}
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" {...register(`items.${index}.unitPrice`)} disabled={isDisabled} min="0" step="0.01" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70" />
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-slate-500">
                        {formatCurrency((watch(`items.${index}.quantity`) || 0) * (watch(`items.${index}.unitPrice`) || 0))}
                      </td>
                      <td className="px-4 py-2">
                        {!isDisabled && (
                          <button type="button" onClick={() => remove(index)} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer">
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
          {!isDisabled && (
            <button type="button" onClick={() => append({ productId: "", description: "", quantity: 1, unitPrice: 0 })} className="flex items-center gap-2 px-3 py-1.5 mt-3 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          )}
          {errors.items && typeof errors.items === "object" && !Array.isArray(errors.items) && (
            <p className="text-xs text-red-500 mt-2">{errors.items.message}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Summary</h2>
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-700">{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <label className="font-semibold">Discount</label>
                <input type="number" {...register("discountAmount")} disabled={isDisabled} min="0" step="0.01" className="w-32 px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-700 text-right font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70" />
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <label className="font-semibold">Tax</label>
                <input type="number" {...register("taxAmount")} disabled={isDisabled} min="0" step="0.01" className="w-32 px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-700 text-right font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70" />
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Grand Total</span>
                <span className="font-mono">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
