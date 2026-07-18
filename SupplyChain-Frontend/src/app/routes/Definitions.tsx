import { DefinitionsTabs } from "@/features/definitions/components/DefinitionsTabs"

export function Definitions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Definitions & Setup</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage master data for your supply chain operations.</p>
      </div>
      <DefinitionsTabs />
    </div>
  )
}
