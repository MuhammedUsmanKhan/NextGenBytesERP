export interface ProductDto {
  id: string
  productCode: string
  productName: string
  productTypeId: string
  productTypeName?: string
  categoryId: string
  categoryName?: string
  subCategoryId?: string | null
  subCategoryName?: string | null
  brandId?: string | null
  brandName?: string | null
  productGroupId?: string | null
  productGroupName?: string | null
  unitId: string
  unitShortName?: string
  weight?: number | null
  thickness?: number | null
  colourScheme?: string | null
  status: "Active" | "Inactive"
  createdAt: string
  updatedAt: string | null
}

export interface CreateProductRequest {
  productTypeId: string
  productName: string
  categoryId: string
  subCategoryId?: string | null
  brandId?: string | null
  productGroupId?: string | null
  unitId: string
  weight?: number | null
  thickness?: number | null
  colourScheme?: string | null
  status: "Active" | "Inactive"
}

export interface UpdateProductRequest {
  productTypeId: string
  productName: string
  categoryId: string
  subCategoryId?: string | null
  brandId?: string | null
  productGroupId?: string | null
  unitId: string
  weight?: number | null
  thickness?: number | null
  colourScheme?: string | null
  status: "Active" | "Inactive"
}

export interface ProductFilters {
  page?: number
  pageSize?: number
  search?: string
  productTypeId?: string
  categoryId?: string
  brandId?: string
  status?: string
}

export interface NextProductCodeDto {
  productCode: string
  productTypeId: string
}
