import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MasterDataTable, type MasterDataItem } from "./MasterDataTable"

interface TabContentProps {
  searchPlaceholder: string
  addLabel: string
  items: MasterDataItem[]
}

export function TabContent({ searchPlaceholder, addLabel, items }: TabContentProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder={searchPlaceholder} className="pl-10" />
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          {addLabel}
        </Button>
      </div>
      <MasterDataTable items={items} />
    </div>
  )
}
