import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TabContent } from "./TabContent"
import type { MasterDataItem } from "./MasterDataTable"

interface TabConfig {
  value: string
  label: string
  searchPlaceholder: string
  addLabel: string
  items: MasterDataItem[]
}

const tabs: TabConfig[] = [
  {
    value: "main-category",
    label: "Main Category",
    searchPlaceholder: "Search categories...",
    addLabel: "Add New Category",
    items: [
      { code: "CAT-001", name: "Electronics", status: "Active" },
      { code: "CAT-002", name: "Furniture", status: "Active" },
      { code: "CAT-003", name: "Office Supplies", status: "Inactive" },
      { code: "CAT-004", name: "Industrial Equipment", status: "Active" },
    ],
  },
  {
    value: "sub-category",
    label: "Sub Category",
    searchPlaceholder: "Search sub categories...",
    addLabel: "Add New Sub Category",
    items: [
      { code: "SUB-001", name: "Smartphones", status: "Active" },
      { code: "SUB-002", name: "Laptops", status: "Active" },
      { code: "SUB-003", name: "Office Chairs", status: "Active" },
      { code: "SUB-004", name: "Desks", status: "Inactive" },
    ],
  },
  {
    value: "brand",
    label: "Brand",
    searchPlaceholder: "Search brands...",
    addLabel: "Add New Brand",
    items: [
      { code: "BR-001", name: "TechPro", status: "Active" },
      { code: "BR-002", name: "OfficeMax", status: "Active" },
      { code: "BR-003", name: "ErgoComfort", status: "Active" },
      { code: "BR-004", name: "InnovaBuild", status: "Inactive" },
    ],
  },
  {
    value: "warehouse",
    label: "Warehouse",
    searchPlaceholder: "Search warehouses...",
    addLabel: "Add New Warehouse",
    items: [
      { code: "WH-001", name: "Main Distribution Center", status: "Active" },
      { code: "WH-002", name: "East Side Storage", status: "Active" },
      { code: "WH-003", name: "West Fulfillment Hub", status: "Active" },
      { code: "WH-004", name: "Cold Storage Facility", status: "Active" },
    ],
  },
  {
    value: "product-group",
    label: "Product Group",
    searchPlaceholder: "Search product groups...",
    addLabel: "Add New Product Group",
    items: [
      { code: "PG-001", name: "Consumer Electronics", status: "Active" },
      { code: "PG-002", name: "Office Furniture", status: "Active" },
      { code: "PG-003", name: "Packaging Materials", status: "Active" },
      { code: "PG-004", name: "Safety Equipment", status: "Inactive" },
    ],
  },
  {
    value: "transporter",
    label: "Transporter",
    searchPlaceholder: "Search transporters...",
    addLabel: "Add New Transporter",
    items: [
      { code: "TR-001", name: "FastTrack Logistics", status: "Active" },
      { code: "TR-002", name: "GlobalShip Couriers", status: "Active" },
      { code: "TR-003", name: "AirSpeed Delivery", status: "Inactive" },
      { code: "TR-004", name: "RailNet Cargo", status: "Active" },
    ],
  },
]

export function DefinitionsTabs() {
  return (
    <Tabs defaultValue="main-category" className="w-full">
      <TabsList className="flex-wrap gap-1 bg-zinc-100 p-1">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <TabContent
            searchPlaceholder={tab.searchPlaceholder}
            addLabel={tab.addLabel}
            items={tab.items}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
