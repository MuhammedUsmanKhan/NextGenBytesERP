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
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white py-12">
        <p className="text-sm text-zinc-500">No records found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className="px-6 py-4 font-semibold text-slate-600">Code</th>
            <th className="px-6 py-4 font-semibold text-slate-600">Name</th>
            <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
            <th className="px-6 py-4 text-right font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {items.map((item) => (
            <tr key={item.code} className="transition-colors hover:bg-zinc-50/50">
              <td className="px-6 py-4 font-mono text-xs text-zinc-500">{item.code}</td>
              <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
              <td className="px-6 py-4">
                <Badge variant={item.status === "Active" ? "success" : "secondary"}>
                  {item.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right">
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
