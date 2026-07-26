import { useState, useEffect, useCallback, useMemo } from "react"
import { Search, Plus, Eye, Edit2, Trash2, Loader2 } from "lucide-react"
import {
  useGetProducts,
  useGetProductById,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useGetNextProductCode,
  useDefinitionList,
} from "@/hooks"
import type { ProductDto } from "@/types/product.types"
import { ProductDialog } from "@/features/products/components/ProductDialog"
import { ProductDeleteConfirm } from "@/features/products/components/ProductDeleteConfirm"
import type { ProductFormValues } from "@/features/products/components/ProductForm"

const PAGE_SIZE = 20

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
]

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filters, setFilters] = useState({ productTypeId: "", categoryId: "", brandId: "", status: "" })
  const [page, setPage] = useState(1)

  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null)
  const [currentProductTypeId, setCurrentProductTypeId] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filters])

  const queryFilters = {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
  }

  const { data: pagedData, isLoading } = useGetProducts(queryFilters)
  const { data: productDetail } = useGetProductById(selectedProductId)
  const { data: productTypes } = useDefinitionList("product-types", { pageSize: 100 })
  const { data: categories } = useDefinitionList("main-categories", { pageSize: 100 })
  const effectiveCategoryId = useMemo(() =>
    selectedCategoryId ?? ((dialogMode === "edit" || dialogMode === "view") ? productDetail?.categoryId ?? null : null),
    [selectedCategoryId, dialogMode, productDetail?.categoryId],
  )
  const { data: subCategories } = useDefinitionList("sub-categories", { pageSize: 100, mainCategoryId: effectiveCategoryId ?? undefined }, !!effectiveCategoryId)
  const { data: brands } = useDefinitionList("brands", { pageSize: 100 })
  const { data: productGroups } = useDefinitionList("product-groups", { pageSize: 100 })
  const { data: units } = useDefinitionList("units", { pageSize: 100 })

  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()

  const { data: nextCode, isLoading: isLoadingCode } = useGetNextProductCode(
    dialogMode === "create" ? currentProductTypeId : null
  )

  const items = pagedData?.items ?? []
  const totalCount = pagedData?.totalCount ?? 0
  const totalPages = pagedData?.totalPages ?? 0
  const currentPage = pagedData?.page ?? 1

  const ptOptions = (productTypes?.items ?? []).map((pt: any) => ({ id: pt.id, code: pt.code, name: pt.name }))
  const catOptions = (categories?.items ?? []).map((c: any) => ({ id: c.id, code: c.code, name: c.name }))
  const scOptions = (subCategories?.items ?? []).map((sc: any) => ({ id: sc.id, code: sc.code, name: sc.name, mainCategoryId: sc.mainCategoryId }))
  const bOptions = (brands?.items ?? []).map((b: any) => ({ id: b.id, code: b.code, name: b.name }))
  const pgOptions = (productGroups?.items ?? []).map((pg: any) => ({ id: pg.id, code: pg.code, name: pg.name }))
  const uOptions = (units?.items ?? []).map((u: any) => ({ id: u.id, code: u.code, name: u.name }))

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleOpenCreate = () => {
    setSelectedProductId(null)
    setCurrentProductTypeId(null)
    setSelectedCategoryId(null)
    setDialogMode("create")
  }

  const handleOpenEdit = (id: string) => {
    setSelectedProductId(id)
    setCurrentProductTypeId(null)
    setSelectedCategoryId(null)
    setDialogMode("edit")
  }

  const handleOpenView = (id: string) => {
    setSelectedProductId(id)
    setCurrentProductTypeId(null)
    setSelectedCategoryId(null)
    setDialogMode("view")
  }

  const handleCloseDialog = () => {
    setDialogMode(null)
    setSelectedProductId(null)
    setCurrentProductTypeId(null)
    setSelectedCategoryId(null)
  }

  const handleProductTypeChange = useCallback((productTypeId: string) => {
    console.log("[Products] handleProductTypeChange called:", productTypeId)
    setCurrentProductTypeId(productTypeId || null)
  }, [])

  const handleCategoryChange = useCallback((categoryId: string) => {
    console.log("[Products] handleCategoryChange called:", categoryId)
    setSelectedCategoryId(categoryId || null)
  }, [])

  const handleSubmit = (data: ProductFormValues) => {
    const payload = {
      ...data,
      weight: data.weight || null,
      thickness: data.thickness || null,
      colourScheme: data.colourScheme || null,
      subCategoryId: data.subCategoryId || null,
      brandId: data.brandId || null,
      productGroupId: data.productGroupId || null,
    }

    if (dialogMode === "edit" && selectedProductId) {
      updateMutation.mutate({ id: selectedProductId, data: payload }, { onSuccess: () => handleCloseDialog() })
    } else {
      createMutation.mutate(payload, { onSuccess: () => handleCloseDialog() })
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span><span>/</span><span className="text-slate-800">Products</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your product catalog.</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 cursor-pointer">
          <Plus className="w-4 h-4" /> New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-60">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></span>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by code or name..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <select value={filters.productTypeId} onChange={(e) => setFilters((f) => ({ ...f, productTypeId: e.target.value }))} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
              <option value="">All Product Types</option>
              {ptOptions.map((pt) => (<option key={pt.id} value={pt.id}>{pt.code} - {pt.name}</option>))}
            </select>
            <select value={filters.categoryId} onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
              <option value="">All Categories</option>
              {catOptions.map((c) => (<option key={c.id} value={c.id}>{c.code} - {c.name}</option>))}
            </select>
            <select value={filters.brandId} onChange={(e) => setFilters((f) => ({ ...f, brandId: e.target.value }))} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
              <option value="">All Brands</option>
              {bOptions.map((b) => (<option key={b.id} value={b.id}>{b.code} - {b.name}</option>))}
            </select>
            <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
              {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
            {(filters.productTypeId || filters.categoryId || filters.brandId || filters.status) && (
              <button onClick={() => setFilters({ productTypeId: "", categoryId: "", brandId: "", status: "" })} className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer">Clear Filters</button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Product Code</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Product Type</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Sub Category</th>
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4">Product Group</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                      {debouncedSearch || filters.productTypeId || filters.categoryId || filters.brandId || filters.status
                        ? "No products match your filters."
                        : "No products found."}
                    </td>
                  </tr>
                ) : (
                  items.map((item: ProductDto) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4.5 font-mono text-xs text-slate-500">{item.productCode}</td>
                      <td className="px-6 py-4.5 font-bold text-slate-900">{item.productName}</td>
                      <td className="px-6 py-4.5 text-slate-500">{item.productTypeName ?? "—"}</td>
                      <td className="px-6 py-4.5 text-slate-500">{item.categoryName ?? "—"}</td>
                      <td className="px-6 py-4.5 text-slate-500">{item.subCategoryName ?? "—"}</td>
                      <td className="px-6 py-4.5 text-slate-500">{item.brandName ?? "—"}</td>
                      <td className="px-6 py-4.5 text-slate-500">{item.productGroupName ?? "—"}</td>
                      <td className="px-6 py-4.5 text-slate-500">{item.unitShortName ?? "—"}</td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${item.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"}`}>{item.status}</span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center justify-end gap-2.5">
                          <button onClick={() => handleOpenView(item.id)} className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer" title="View"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleOpenEdit(item.id)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget(item)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Showing {items.length} of {totalCount} records</span>
          <div className="flex items-center gap-3">
            {totalPages > 0 && <span>Page {currentPage} of {totalPages}</span>}
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="p-1.5 hover:bg-slate-200 rounded-lg disabled:opacity-30 cursor-pointer">Prev</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-1.5 hover:bg-slate-200 rounded-lg disabled:opacity-30 cursor-pointer">Next</button>
            </div>
          </div>
        </div>
      </div>

      {dialogMode && (
        <ProductDialog
          open
          onClose={handleCloseDialog}
          mode={dialogMode}
          title={dialogMode === "create" ? "New Product" : dialogMode === "edit" ? "Edit Product" : "View Product"}
          initialData={dialogMode !== "create" && productDetail ? {
            productTypeId: productDetail.productTypeId,
            productName: productDetail.productName,
            categoryId: productDetail.categoryId,
            subCategoryId: productDetail.subCategoryId ?? null,
            brandId: productDetail.brandId ?? null,
            productGroupId: productDetail.productGroupId ?? null,
            unitId: productDetail.unitId,
            weight: productDetail.weight ?? null,
            thickness: productDetail.thickness ?? null,
            colourScheme: productDetail.colourScheme ?? "",
            status: productDetail.status,
          } : undefined}
          productCode={dialogMode === "create" ? (nextCode?.productCode ?? "") : (productDetail?.productCode ?? "")}
          isLoadingCode={!!(isLoadingCode && dialogMode === "create" && currentProductTypeId)}
          productTypes={ptOptions}
          categories={catOptions}
          subCategories={scOptions}
          brands={bOptions}
          productGroups={pgOptions}
          units={uOptions}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onProductTypeChange={handleProductTypeChange}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {deleteTarget && (
        <ProductDeleteConfirm
          open
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          productName={deleteTarget.productName}
          productCode={deleteTarget.productCode}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
