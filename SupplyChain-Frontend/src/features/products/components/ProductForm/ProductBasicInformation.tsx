import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { ProductFormValues } from "."

interface Props {
  form: UseFormReturn<ProductFormValues>
  productCode: string
  isLoadingCode: boolean
  productTypes: { id: string; code: string; name: string }[]
  mode: "create" | "edit" | "view"
  onProductTypeChange?: (productTypeId: string) => void
}

export function ProductBasicInformation({ form, productCode, isLoadingCode, productTypes, mode, onProductTypeChange }: Props) {
  const isReadOnly = mode === "view"
  const isEditMode = mode === "edit"
  const [selectedTypeId, setSelectedTypeId] = useState("")

  const handleProductTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedTypeId(value)
    form.setValue("productTypeId", value)
    onProductTypeChange?.(value)
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-bold text-slate-800">Basic Information</legend>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product Type</label>
        <select
          {...form.register("productTypeId")}
          onChange={handleProductTypeChange}
          disabled={isReadOnly || isEditMode}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:opacity-75"
        >
          <option value="">Select product type...</option>
          {productTypes.map((pt) => (
            <option key={pt.id} value={pt.id}>{pt.code} - {pt.name}</option>
          ))}
        </select>
        {form.formState.errors.productTypeId && (
          <p className="text-xs text-red-500 mt-1">{form.formState.errors.productTypeId.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product Code</label>
        <div className="relative">
          <input
            type="text"
            value={productCode}
            disabled
            placeholder={!selectedTypeId ? "Select a Product Type first" : isLoadingCode ? "Fetching code..." : ""}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 bg-slate-50/50 disabled:opacity-75 transition-all pr-8"
          />
          {isLoadingCode && (
            <span className="absolute inset-y-0 right-2 flex items-center">
              <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product Name</label>
        <input
          type="text"
          {...form.register("productName")}
          disabled={isReadOnly}
          placeholder="Enter product name"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-75"
        />
        {form.formState.errors.productName && (
          <p className="text-xs text-red-500 mt-1">{form.formState.errors.productName.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="radio"
              value="Active"
              checked={form.watch("status") === "Active"}
              onChange={() => form.setValue("status", "Active")}
              disabled={isReadOnly}
              className="text-blue-600 focus:ring-blue-500"
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="radio"
              value="Inactive"
              checked={form.watch("status") === "Inactive"}
              onChange={() => form.setValue("status", "Inactive")}
              disabled={isReadOnly}
              className="text-blue-600 focus:ring-blue-500"
            />
            Inactive
          </label>
        </div>
      </div>
    </fieldset>
  )
}
