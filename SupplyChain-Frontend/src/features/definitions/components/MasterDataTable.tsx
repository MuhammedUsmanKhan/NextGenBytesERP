import { Edit2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface MasterDataItem {
  code: string
  name: string
  status: "Active" | "Inactive"
}

interface MasterDataTableProps {
  items: MasterDataItem[]
}

export function MasterDataTable({ items }: MasterDataTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white py-12">
        <p className="text-sm text-slate-500">No records found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50">
          <tr>
            <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Code</th>
            <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</th>
            <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
            <th className="px-6 py-4.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.code} className="transition-colors hover:bg-slate-50/50">
              <td className="px-6 py-4.5 font-mono text-xs text-slate-500">{item.code}</td>
              <td className="px-6 py-4.5 font-medium text-slate-900">{item.name}</td>
              <td className="px-6 py-4.5">
                <Badge variant={item.status === "Active" ? "success" : "secondary"}>
                  {item.status}
                </Badge>
              </td>
              <td className="px-6 py-4.5 text-right">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                  <Edit2 className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
