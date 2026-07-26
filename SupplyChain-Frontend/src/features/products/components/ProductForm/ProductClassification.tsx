import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { ProductFormValues } from "."

interface Props {
  form: UseFormReturn<ProductFormValues>
  categories: { id: string; code: string; name: string }[]
  subCategories: { id: string; code: string; name: string; mainCategoryId: string }[]
  brands: { id: string; code: string; name: string }[]
  productGroups: { id: string; code: string; name: string }[]
  units: { id: string; code: string; name: string }[]
  mode: "create" | "edit" | "view"
  onCategoryChange?: (categoryId: string) => void
}

export function ProductClassification({ form, categories, subCategories, brands, productGroups, units, mode, onCategoryChange }: Props) {
  const isReadOnly = mode === "view"
  const [selectedCategoryId, setSelectedCategoryId] = useState("")

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedCategoryId(value)
    form.setValue("categoryId", value)
    form.setValue("subCategoryId", null)
    onCategoryChange?.(value)
  }

  const filteredSubCategories = subCategories.filter(
    (sc) => !selectedCategoryId || sc.mainCategoryId === selectedCategoryId
  )

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-bold text-slate-800">Classification</legend>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
        <select
          {...form.register("categoryId")}
          onChange={handleCategoryChange}
          disabled={isReadOnly}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:opacity-75"
        >
          <option value="">Select category...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
          ))}
        </select>
        {form.formState.errors.categoryId && (
          <p className="text-xs text-red-500 mt-1">{form.formState.errors.categoryId.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sub Category</label>
        <select
          {...form.register("subCategoryId")}
          disabled={isReadOnly || !selectedCategoryId}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:opacity-75"
        >
          <option value="">{selectedCategoryId ? "Select sub category..." : "Select a category first"}</option>
          {filteredSubCategories.map((sc) => (
            <option key={sc.id} value={sc.id}>{sc.code} - {sc.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Brand</label>
        <select
          {...form.register("brandId")}
          disabled={isReadOnly}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:opacity-75"
        >
          <option value="">Select brand...</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product Group</label>
        <select
          {...form.register("productGroupId")}
          disabled={isReadOnly}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:opacity-75"
        >
          <option value="">Select product group...</option>
          {productGroups.map((pg) => (
            <option key={pg.id} value={pg.id}>{pg.code} - {pg.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Unit</label>
        <select
          {...form.register("unitId")}
          disabled={isReadOnly}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:opacity-75"
        >
          <option value="">Select unit...</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.code} - {u.name}</option>
          ))}
        </select>
        {form.formState.errors.unitId && (
          <p className="text-xs text-red-500 mt-1">{form.formState.errors.unitId.message as string}</p>
        )}
      </div>
    </fieldset>
  )
}
