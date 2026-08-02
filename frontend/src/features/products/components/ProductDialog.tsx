import { ProductForm, type ProductFormValues } from "./ProductForm"

interface Props {
  open: boolean
  onClose: () => void
  mode: "create" | "edit" | "view"
  title: string
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
  isSubmitting: boolean
  onProductTypeChange?: (productTypeId: string) => void
  onCategoryChange?: (categoryId: string) => void
}

export function ProductDialog({
  open,
  onClose,
  mode,
  title,
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
  isSubmitting,
  onProductTypeChange,
  onCategoryChange,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-2xl w-full overflow-y-auto max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold hover:bg-slate-100 p-1 rounded-lg text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="p-6">
          <ProductForm
            mode={mode}
            initialData={initialData}
            productCode={productCode}
            isLoadingCode={isLoadingCode}
            productTypes={productTypes}
            categories={categories}
            subCategories={subCategories}
            brands={brands}
            productGroups={productGroups}
            units={units}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            onProductTypeChange={onProductTypeChange}
            onCategoryChange={onCategoryChange}
          />
        </div>
      </div>
    </div>
  )
}
