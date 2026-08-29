import api from "./axios"
import type { ApiResponse, PagedResponse } from "@/types"
import type { ProductDto, CreateProductRequest, UpdateProductRequest, ProductFilters, NextProductCodeDto } from "@/types/product.types"

interface ProductApiRaw {
  id: string
  productCode: string
  name: string
  productTypeId: string
  productTypeName: string
  categoryId: string
  categoryName: string
  subCategoryId: string | null
  subCategoryName: string | null
  brandId: string | null
  brandName: string | null
  productGroupId: string | null
  productGroupName: string | null
  unitId: string
  unitName: string
  unitShortName: string
  weight: number | null
  thicknessGSM: number | null
  colorScheme: string | null
  status: "Active" | "Inactive"
  createdAt: string
  createdBy: string
  updatedAt: string | null
  updatedBy: string | null
  productName?: string
}

function mapItem(raw: ProductApiRaw): ProductDto {
  const { name, productName, ...rest } = raw
  return { ...rest, productName: name ?? productName }
}

export async function getProducts(params?: ProductFilters) {
  const response = await api.get<ApiResponse<PagedResponse<ProductApiRaw>>>("/api/v1/products", { params })
  const paged = response.data.data
  return {
    ...paged,
    items: paged.items?.map(mapItem) ?? [],
  } as PagedResponse<ProductDto>
}

export async function getProductById(id: string) {
  const response = await api.get<ApiResponse<ProductApiRaw>>(`/api/v1/products/${id}`)
  return mapItem(response.data.data)
}

export async function createProduct(data: CreateProductRequest) {
  const { productName, ...rest } = data
  const response = await api.post<ApiResponse<ProductApiRaw>>("/api/v1/products", { name: productName, ...rest })
  return mapItem(response.data.data)
}

export async function updateProduct(id: string, data: UpdateProductRequest) {
  const { productName, ...rest } = data
  const response = await api.put<ApiResponse<ProductApiRaw>>(`/api/v1/products/${id}`, { name: productName, ...rest })
  return mapItem(response.data.data)
}

export async function deleteProduct(id: string) {
  await api.delete(`/api/v1/products/${id}`)
}

export async function getNextProductCode(productTypeId: string) {
  const response = await api.get<ApiResponse<NextProductCodeDto>>("/api/v1/products/next-code", { params: { productTypeId } })
  return response.data.data
}
