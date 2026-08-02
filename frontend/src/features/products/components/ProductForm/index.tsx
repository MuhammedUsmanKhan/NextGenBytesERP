import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ProductBasicInformation } from "./ProductBasicInformation"
import { ProductClassification } from "./ProductClassification"
import { ProductAdditionalInformation } from "./ProductAdditionalInformation"

export const productSchema = z.object({
  productTypeId: z.string().min(1, "Product type is required"),
  productName: z.string().min(2, "Min 2 characters").max(200, "Max 200 characters"),
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().nullable().optional().default(null),
  brandId: z.string().nullable().optional().default(null),
  productGroupId: z.string().nullable().optional().default(null),
  unitId: z.string().min(1, "Unit is required"),
  weight: z.coerce.number().min(0, "Min 0").max(99999.999, "Max 99999.999").nullable().optional().default(null),
  thickness: z.coerce.number().min(0, "Min 0").max(99999.999, "Max 99999.999").nullable().optional().default(null),
  colourScheme: z.string().max(100, "Max 100 characters").nullable().optional().default(""),
  status: z.enum(["Active", "Inactive"]),
})

export type ProductFormValues = z.infer<typeof productSchema>

export function getDefaultProductFormValues(): ProductFormValues {
  return {
    productTypeId: "",
    productName: "",
    categoryId: "",
    subCategoryId: null,
    brandId: null,
    productGroupId: null,
    unitId: "",
    weight: null,
    thickness: null,
    colourScheme: "",
    status: "Active",
  }
}

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
    resolver: zodResolver(productSchema) as any,
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
