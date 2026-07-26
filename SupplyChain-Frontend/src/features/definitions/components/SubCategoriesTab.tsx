import { useState, useEffect } from "react"
import { Search, PlusCircle } from "lucide-react"
import { z } from "zod"
import {
  useDefinitionList,
  useCreateDefinition,
  useUpdateDefinition,
  useUpdateDefinitionStatus,
  useDeleteDefinition,
  useMainCategoryLookup,
} from "@/hooks"
import type { SubCategoryDto } from "@/types/definition.types"
import { DefinitionTable, type Column } from "./DefinitionTable"
import { DefinitionFormDialog } from "./DefinitionFormDialog"

const PAGE_SIZE = 20

const schema = z.object({
  code: z.string().min(1, "Code is required").max(10, "Max 10 characters"),
  name: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
  mainCategoryId: z.string().min(1, "Main category is required"),
  status: z.enum(["Active", "Inactive"]),
})

type FormValues = z.infer<typeof schema>
const defaultValues: FormValues = { code: "", name: "", mainCategoryId: "", status: "Active" }

const columns: Column<SubCategoryDto>[] = [
  { key: "code", header: "Code", render: (item) => <span className="font-mono text-xs text-slate-500">{item.code}</span> },
  { key: "name", header: "Name", render: (item) => <span className="text-slate-900 font-semibold">{item.name}</span> },
  { key: "mainCategory", header: "Main Category", render: (item) => <span className="text-xs text-slate-500">{item.mainCategoryName}</span> },
  { key: "status", header: "Status", render: (item) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${item.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />{item.status}
    </span>
  )},
]

export default function SubCategoriesTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SubCategoryDto | null>(null)

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchQuery), 300); return () => clearTimeout(t) }, [searchQuery])
  useEffect(() => { setPage(1) }, [debouncedSearch, statusFilter])

  const { data: pagedData, isLoading } = useDefinitionList("sub-categories", { page, pageSize: PAGE_SIZE, search: debouncedSearch || undefined, status: statusFilter || undefined })
  const { data: mainCategoryLookup } = useMainCategoryLookup()
  const createMutation = useCreateDefinition("sub-categories")
  const updateMutation = useUpdateDefinition("sub-categories")
  const updateStatusMutation = useUpdateDefinitionStatus("sub-categories")
  const deleteMutation = useDeleteDefinition("sub-categories")

  const items = pagedData?.items ?? []; const totalCount = pagedData?.totalCount ?? 0; const totalPages = pagedData?.totalPages ?? 0

  const handleSubmit = (data: FormValues) => {
    if (editingItem) { updateMutation.mutate({ id: editingItem.id, data }, { onSuccess: () => setIsDialogOpen(false) }) }
    else { createMutation.mutate(data, { onSuccess: () => setIsDialogOpen(false) }) }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></span>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search sub categories..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
            <option value="">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
          </select>
        </div>
        <button onClick={() => { setEditingItem(null); setIsDialogOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 cursor-pointer">
          <PlusCircle className="w-4 h-4" /> Add New Sub Category
        </button>
      </div>

      <DefinitionTable columns={columns} items={items} isLoading={isLoading} totalCount={totalCount} page={page} totalPages={totalPages} onPageChange={setPage}
        onToggleStatus={(item) => updateStatusMutation.mutate({ id: item.id, status: item.status === "Active" ? "Inactive" : "Active" })}
        onEdit={(item) => { setEditingItem(item); setIsDialogOpen(true) }}
        onDelete={(item) => { if (confirm(`Are you sure you want to delete "${item.name}"?`)) deleteMutation.mutate(item.id) }}
        isStatusPending={updateStatusMutation.isPending}
      />

      <DefinitionFormDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={editingItem ? "Edit Sub Category" : "Add New Sub Category"} schema={schema}
        defaultValues={editingItem ? { code: editingItem.code, name: editingItem.name, mainCategoryId: editingItem.mainCategoryId, status: editingItem.status } : defaultValues}
        onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} isEditMode={!!editingItem}>
        {(form) => (
          <>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Code ID (Unique)</label>
              <input type="text" {...form.register("code")} disabled={!!editingItem} placeholder="e.g. SUB-001" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-75 transition-all" />
              {form.formState.errors.code && <p className="text-xs text-red-500 mt-1">{form.formState.errors.code.message as string}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Name / Title</label>
              <input type="text" {...form.register("name")} placeholder="Enter sub category name" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              {form.formState.errors.name && <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message as string}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Main Category</label>
              <select {...form.register("mainCategoryId")} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
                <option value="">Select main category...</option>
                {mainCategoryLookup?.map((mc) => (
                  <option key={mc.id} value={mc.id}>{mc.code} - {mc.name}</option>
                ))}
              </select>
              {form.formState.errors.mainCategoryId && <p className="text-xs text-red-500 mt-1">{form.formState.errors.mainCategoryId.message as string}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Default Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="radio" value="Active" checked={form.watch("status") === "Active"} onChange={() => form.setValue("status", "Active")} className="text-blue-600 focus:ring-blue-500" /> Active
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="radio" value="Inactive" checked={form.watch("status") === "Inactive"} onChange={() => form.setValue("status", "Inactive")} className="text-blue-600 focus:ring-blue-500" /> Inactive
                </label>
              </div>
            </div>
          </>
        )}
      </DefinitionFormDialog>
    </div>
  )
}
