export type DefinitionTab = "main-categories" | "sub-categories" | "brands" | "warehouses" | "product-groups" | "transporters" | "product-types" | "units"

export const DEFINITION_TABS: { key: DefinitionTab; label: string }[] = [
  { key: "main-categories", label: "Main Category" },
  { key: "sub-categories", label: "Sub Category" },
  { key: "brands", label: "Brand" },
  { key: "warehouses", label: "Warehouse" },
  { key: "product-groups", label: "Product Group" },
  { key: "transporters", label: "Transporter" },
  { key: "product-types", label: "Product Types" },
  { key: "units", label: "Units" },
]

export interface MainCategoryDto {
  id: string
  code: string
  name: string
  status: "Active" | "Inactive"
  createdAt: string
  updatedAt: string | null
}

export interface SubCategoryDto {
  id: string
  code: string
  name: string
  status: "Active" | "Inactive"
  mainCategoryId: string
  mainCategoryName: string
  createdAt: string
  updatedAt: string | null
}

export interface BrandDto {
  id: string
  code: string
  name: string
  status: "Active" | "Inactive"
  createdAt: string
  updatedAt: string | null
}

export interface WarehouseDto {
  id: string
  code: string
  name: string
  location: string | null
  status: "Active" | "Inactive"
  createdAt: string
  updatedAt: string | null
}

export interface ProductGroupDto {
  id: string
  code: string
  name: string
  status: "Active" | "Inactive"
  createdAt: string
  updatedAt: string | null
}

export interface TransporterDto {
  id: string
  code: string
  name: string
  contactNumber: string | null
  status: "Active" | "Inactive"
  createdAt: string
  updatedAt: string | null
}

export interface ProductTypeDto {
  id: string
  code: string
  name: string
  codePrefix: number
  status: "Active" | "Inactive"
  createdAt: string
  updatedAt: string | null
}

export interface UnitDto {
  id: string
  code: string
  name: string
  shortName: string
  decimalPlaces: number
  status: "Active" | "Inactive"
  createdAt: string
  updatedAt: string | null
}

export interface MainCategoryLookupDto {
  id: string
  code: string
  name: string
}

export type DefinitionDto = MainCategoryDto | SubCategoryDto | BrandDto | WarehouseDto | ProductGroupDto | TransporterDto | ProductTypeDto | UnitDto

export interface CreateMainCategoryRequest {
  code: string
  name: string
  status: "Active" | "Inactive"
}

export interface CreateSubCategoryRequest {
  code: string
  name: string
  status: "Active" | "Inactive"
  mainCategoryId: string
}

export interface CreateBrandRequest {
  code: string
  name: string
  status: "Active" | "Inactive"
}

export interface CreateWarehouseRequest {
  code: string
  name: string
  location: string | null
  status: "Active" | "Inactive"
}

export interface CreateProductGroupRequest {
  code: string
  name: string
  status: "Active" | "Inactive"
}

export interface CreateTransporterRequest {
  code: string
  name: string
  contactNumber: string | null
  status: "Active" | "Inactive"
}

export interface UpdateMainCategoryRequest {
  code: string
  name: string
  status: "Active" | "Inactive"
}

export interface UpdateSubCategoryRequest {
  code: string
  name: string
  status: "Active" | "Inactive"
  mainCategoryId: string
}

export interface UpdateBrandRequest {
  code: string
  name: string
  status: "Active" | "Inactive"
}

export interface UpdateWarehouseRequest {
  code: string
  name: string
  location: string | null
  status: "Active" | "Inactive"
}

export interface UpdateProductGroupRequest {
  code: string
  name: string
  status: "Active" | "Inactive"
}

export interface UpdateTransporterRequest {
  code: string
  name: string
  contactNumber: string | null
  status: "Active" | "Inactive"
}

export interface CreateProductTypeRequest {
  code: string
  name: string
  codePrefix: number
  status: "Active" | "Inactive"
}

export interface UpdateProductTypeRequest {
  code: string
  name: string
  codePrefix: number
  status: "Active" | "Inactive"
}

export interface CreateUnitRequest {
  code: string
  name: string
  shortName: string
  decimalPlaces: number
  status: "Active" | "Inactive"
}

export interface UpdateUnitRequest {
  code: string
  name: string
  shortName: string
  decimalPlaces: number
  status: "Active" | "Inactive"
}

export interface UpdateStatusRequest {
  status: "Active" | "Inactive"
}
