export type DefinitionTab = "main-categories" | "sub-categories" | "brands" | "warehouses" | "product-groups" | "transporters" | "product-types" | "units" | "vendors"

export const DEFINITION_TABS: { key: DefinitionTab; label: string }[] = [
  { key: "main-categories", label: "Main Category" },
  { key: "sub-categories", label: "Sub Category" },
  { key: "brands", label: "Brand" },
  { key: "warehouses", label: "Warehouse" },
  { key: "product-groups", label: "Product Group" },
  { key: "transporters", label: "Transporter" },
  { key: "product-types", label: "Product Types" },
  { key: "units", label: "Units" },
  { key: "vendors", label: "Vendor" },
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

export interface VendorDto {
  id: string
  vendorCode: string
  companyName: string
  contactPerson: string | null
  email: string | null
  countryId: string | null
  cityId: string | null
  postalCode: string | null
  address: string | null
  area: string | null
  cnic: string | null
  ntn: string | null
  strn: string | null
  status: "Active" | "Inactive"
  createdAt: string
  createdBy: string
  updatedAt: string | null
  updatedBy: string | null
}

export type DefinitionDto = MainCategoryDto | SubCategoryDto | BrandDto | WarehouseDto | ProductGroupDto | TransporterDto | ProductTypeDto | UnitDto | VendorDto

export interface CreateMainCategoryRequest {
  name: string
  status: "Active" | "Inactive"
}

export interface CreateSubCategoryRequest {
  name: string
  status: "Active" | "Inactive"
  mainCategoryId: string
}

export interface CreateBrandRequest {
  name: string
  status: "Active" | "Inactive"
}

export interface CreateWarehouseRequest {
  name: string
  location: string | null
  status: "Active" | "Inactive"
}

export interface CreateProductGroupRequest {
  name: string
  status: "Active" | "Inactive"
}

export interface CreateTransporterRequest {
  name: string
  contactNumber: string | null
  status: "Active" | "Inactive"
}

export interface UpdateMainCategoryRequest {
  name: string
  status: "Active" | "Inactive"
}

export interface UpdateSubCategoryRequest {
  name: string
  status: "Active" | "Inactive"
  mainCategoryId: string
}

export interface UpdateBrandRequest {
  name: string
  status: "Active" | "Inactive"
}

export interface UpdateWarehouseRequest {
  name: string
  location: string | null
  status: "Active" | "Inactive"
}

export interface UpdateProductGroupRequest {
  name: string
  status: "Active" | "Inactive"
}

export interface UpdateTransporterRequest {
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

export interface CreateVendorRequest {
  companyName: string
  contactPerson?: string
  email?: string
  countryId?: string
  cityId?: string
  postalCode?: string
  address?: string
  area?: string
  cnic?: string
  ntn?: string
  strn?: string
  status: "Active" | "Inactive"
}

export type UpdateVendorRequest = CreateVendorRequest

export interface NextCodeResponse {
  code: string
}

export interface NextVendorCodeResponse {
  vendorCode: string
}

export interface UpdateStatusRequest {
  status: "Active" | "Inactive"
}
