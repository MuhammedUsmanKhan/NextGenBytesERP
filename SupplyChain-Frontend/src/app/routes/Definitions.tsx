import { useState } from "react"
import type { DefinitionTab } from "@/types/definition.types"
import { DEFINITION_TABS } from "@/types/definition.types"
import MainCategoriesTab from "@/features/definitions/components/MainCategoriesTab"
import SubCategoriesTab from "@/features/definitions/components/SubCategoriesTab"
import BrandsTab from "@/features/definitions/components/BrandsTab"
import WarehousesTab from "@/features/definitions/components/WarehousesTab"
import ProductGroupsTab from "@/features/definitions/components/ProductGroupsTab"
import TransportersTab from "@/features/definitions/components/TransportersTab"
import ProductTypesTab from "@/features/definitions/components/ProductTypesTab"
import UnitsTab from "@/features/definitions/components/UnitsTab"

export default function Definitions() {
  const [activeSubTab, setActiveSubTab] = useState<DefinitionTab>("main-categories")

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span>
        <span>/</span>
        <span className="text-slate-800">Definitions & Setup</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Definitions & Setup</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage master data for your supply chain operations.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200/50 w-fit">
        {DEFINITION_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSubTab === tab.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === "main-categories" && <MainCategoriesTab />}
      {activeSubTab === "sub-categories" && <SubCategoriesTab />}
      {activeSubTab === "brands" && <BrandsTab />}
      {activeSubTab === "warehouses" && <WarehousesTab />}
      {activeSubTab === "product-groups" && <ProductGroupsTab />}
      {activeSubTab === "transporters" && <TransportersTab />}
      {activeSubTab === "product-types" && <ProductTypesTab />}
      {activeSubTab === "units" && <UnitsTab />}
    </div>
  )
}
