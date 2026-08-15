import { useEffect } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ProductBasicInformation } from "./ProductBasicInformation"
import { ProductClassification } from "./ProductClassification"
import { ProductAdditionalInformation } from "./ProductAdditionalInformation"
import {
  productSchema,
  getDefaultProductFormValues,
  type ProductFormValues,
} from "./productForm.schema"

export type { ProductFormValues } from "./productForm.schema"

interface Props {
  mode: "create" | "edit" | "view"
  initialData?: ProductFormValues
  productCode: string
  isLoadingCode: boolean
  productTypes: { id: string; code: string; name: string }[]
  categories: { id: string; code: string; name: string }[]
  subCategories: { id: string; code: string; name: string; mainCategoryId: string }[]
  brands: { id: string; code: string; name: string }[]
  productGroups: { id: string; code: string; name: string }[]
  units: { id: string; code: string; name: string }[]
  onSubmit: (data: ProductFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
  onProductTypeChange?: (productTypeId: string) => void
  onCategoryChange?: (categoryId: string) => void
}

export function ProductForm({
  mode,
  initialData,
  productCode,
  isLoadingCode,
  productTypes,
  categories,
  subCategories,
  brands,
  productGroups,
  units,
  onSubmit,
  onCancel,
  isSubmitting,
  onProductTypeChange,
  onCategoryChange,
}: Props) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: initialData ?? getDefaultProductFormValues(),
  })

  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  const isReadOnly = mode === "view"

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <ProductBasicInformation
        form={form}
        productCode={productCode}
        isLoadingCode={isLoadingCode}
        productTypes={productTypes}
        mode={mode}
        onProductTypeChange={onProductTypeChange}
      />
      <ProductClassification
        form={form}
        categories={categories}
        subCategories={subCategories}
        brands={brands}
        productGroups={productGroups}
        units={units}
        mode={mode}
        onCategoryChange={onCategoryChange}
      />
      <ProductAdditionalInformation form={form} mode={mode} />

      {!isReadOnly && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoadingCode}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : mode === "edit" ? "Update Product" : "Create Product"}
          </button>
        </div>
      )}
    </form>
  )
}
