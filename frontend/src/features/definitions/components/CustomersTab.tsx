import { useState, useEffect } from "react"
import { Search, PlusCircle } from "lucide-react"
import { z } from "zod"
import {
  useDefinitionList,
  useCreateDefinition,
  useUpdateDefinition,
  useUpdateDefinitionStatus,
  useDeleteDefinition,
  useNextCustomerCode,
} from "@/hooks"
import type { CustomerDto } from "@/types/definition.types"
import { DefinitionTable, type Column } from "./DefinitionTable"
import { DefinitionFormDialog } from "./DefinitionFormDialog"

const PAGE_SIZE = 20

const schema = z.object({
  companyName: z.string().min(1, "Company name is required").max(256, "Max 256 characters"),
  contactPerson: z.string().max(256, "Max 256 characters").optional().or(z.literal("")),
  email: z.string().max(256, "Max 256 characters").email("Invalid email").optional().or(z.literal("")),
  countryId: z.string().max(50).optional().or(z.literal("")),
  cityId: z.string().max(50).optional().or(z.literal("")),
  postalCode: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  area: z.string().max(200).optional().or(z.literal("")),
  cnic: z.string().max(50).optional().or(z.literal("")),
  ntn: z.string().max(50).optional().or(z.literal("")),
  strn: z.string().max(50).optional().or(z.literal("")),
  status: z.enum(["Active", "Inactive"]),
})

type FormValues = z.infer<typeof schema>
const defaultValues: FormValues = {
  companyName: "",
  contactPerson: "",
  email: "",
  countryId: "",
  cityId: "",
  postalCode: "",
  address: "",
  area: "",
  cnic: "",
  ntn: "",
  strn: "",
  status: "Active",
}

const columns: Column<CustomerDto>[] = [
  { key: "customerCode", header: "Customer Code", render: (item) => <span className="font-mono text-xs text-slate-500">{item.customerCode}</span> },
  { key: "companyName", header: "Company", render: (item) => <span className="text-slate-900 font-semibold">{item.companyName}</span> },
  { key: "contactPerson", header: "Contact Person", render: (item) => <span className="text-xs text-slate-500">{item.contactPerson ?? "-"}</span> },
  { key: "email", header: "Email", render: (item) => <span className="text-xs text-slate-500">{item.email ?? "-"}</span> },
  { key: "countryId", header: "Country", render: (item) => <span className="text-xs text-slate-500">{item.countryId ?? "-"}</span> },
  { key: "cityId", header: "City", render: (item) => <span className="text-xs text-slate-500">{item.cityId ?? "-"}</span> },
  { key: "status", header: "Status", render: (item) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${item.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />{item.status}
    </span>
  )},
]

export default function CustomersTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CustomerDto | null>(null)

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchQuery), 300); return () => clearTimeout(t) }, [searchQuery])
  const { data: pagedData, isLoading } = useDefinitionList("customers", { page, pageSize: PAGE_SIZE, search: debouncedSearch || undefined, status: statusFilter || undefined })
  const { data: nextCodeData, refetch: refetchNextCode } = useNextCustomerCode()
  const createMutation = useCreateDefinition("customers")
  const updateMutation = useUpdateDefinition("customers")
  const updateStatusMutation = useUpdateDefinitionStatus("customers")
  const deleteMutation = useDeleteDefinition("customers")

  const items = pagedData?.items ?? []; const totalCount = pagedData?.totalCount ?? 0; const totalPages = pagedData?.totalPages ?? 0

  const handleSubmit = (data: FormValues) => {
    if (editingItem) { updateMutation.mutate({ id: editingItem.id, data }, { onSuccess: () => setIsDialogOpen(false) }) }
    else { createMutation.mutate(data, { onSuccess: () => { setIsDialogOpen(false); refetchNextCode() } }) }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></span>
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }} placeholder="Search customers..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
            <option value="">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
          </select>
        </div>
        <button onClick={() => { setEditingItem(null); setIsDialogOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 cursor-pointer">
          <PlusCircle className="w-4 h-4" /> Add New Customer
        </button>
      </div>

      <DefinitionTable columns={columns} items={items} isLoading={isLoading} totalCount={totalCount} page={page} totalPages={totalPages} onPageChange={setPage}
        onToggleStatus={(item) => updateStatusMutation.mutate({ id: item.id, status: item.status === "Active" ? "Inactive" : "Active" })}
        onEdit={(item) => { setEditingItem(item); setIsDialogOpen(true) }}
        onDelete={(item) => { if (confirm(`Are you sure you want to delete "${item.companyName}"?`)) deleteMutation.mutate(item.id) }}
        isStatusPending={updateStatusMutation.isPending}
      />

      <DefinitionFormDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={editingItem ? "Edit Customer" : "Add New Customer"} schema={schema}
        defaultValues={editingItem ? {
          companyName: editingItem.companyName,
          contactPerson: editingItem.contactPerson ?? "",
          email: editingItem.email ?? "",
          countryId: editingItem.countryId ?? "",
          cityId: editingItem.cityId ?? "",
          postalCode: editingItem.postalCode ?? "",
          address: editingItem.address ?? "",
          area: editingItem.area ?? "",
          cnic: editingItem.cnic ?? "",
          ntn: editingItem.ntn ?? "",
          strn: editingItem.strn ?? "",
          status: editingItem.status,
        } : defaultValues}
        onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} isEditMode={!!editingItem}>
        {(form) => (
          <>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Customer Code</label>
              <input type="text" value={editingItem ? editingItem.customerCode : (nextCodeData?.customerCode ?? "Loading...")} disabled placeholder="Auto-generated" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 bg-slate-50/50 focus:outline-none disabled:opacity-75 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Name <span className="text-red-500">*</span></label>
              <input type="text" {...form.register("companyName")} placeholder="Enter company name" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              {form.formState.errors.companyName && <p className="text-xs text-red-500 mt-1">{form.formState.errors.companyName.message as string}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Person</label>
                <input type="text" {...form.register("contactPerson")} placeholder="Contact person name" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" {...form.register("email")} placeholder="email@example.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                {form.formState.errors.email && <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message as string}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Country</label>
                <input type="text" {...form.register("countryId")} placeholder="Country" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">City</label>
                <input type="text" {...form.register("cityId")} placeholder="City" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Postal Code</label>
                <input type="text" {...form.register("postalCode")} placeholder="Postal code" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Area</label>
                <input type="text" {...form.register("area")} placeholder="Area / locality" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Address</label>
              <input type="text" {...form.register("address")} placeholder="Street address" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">CNIC</label>
                <input type="text" {...form.register("cnic")} placeholder="CNIC number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">NTN</label>
                <input type="text" {...form.register("ntn")} placeholder="NTN number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">STRN</label>
                <input type="text" {...form.register("strn")} placeholder="STRN number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
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