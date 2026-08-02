import api from "./axios"
import type { ApiResponse, PagedResponse } from "@/types"
import type { ProductDto, CreateProductRequest, UpdateProductRequest, ProductFilters, NextProductCodeDto } from "@/types/product.types"

function mapItem(raw: any): ProductDto {
  return { ...raw, productName: raw.name ?? raw.productName }
}

export async function getProducts(params?: ProductFilters) {
  const response = await api.get<ApiResponse<any>>("/api/v1/products", { params })
  const paged = response.data.data
  return {
    ...paged,
    items: paged.items?.map(mapItem) ?? [],
  } as PagedResponse<ProductDto>
}

export async function getProductById(id: string) {
  const response = await api.get<ApiResponse<any>>(`/api/v1/products/${id}`)
  return mapItem(response.data.data)
}

export async function createProduct(data: CreateProductRequest) {
  const { productName, ...rest } = data
  const response = await api.post<ApiResponse<any>>("/api/v1/products", { name: productName, ...rest })
  return mapItem(response.data.data)
}

export async function updateProduct(id: string, data: UpdateProductRequest) {
  const { productName, ...rest } = data
  const response = await api.put<ApiResponse<any>>(`/api/v1/products/${id}`, { name: productName, ...rest })
  return mapItem(response.data.data)
}

export async function deleteProduct(id: string) {
  await api.delete(`/api/v1/products/${id}`)
}

export async function getNextProductCode(productTypeId: string) {
  const response = await api.get<ApiResponse<NextProductCodeDto>>("/api/v1/products/next-code", { params: { productTypeId } })
  return response.data.data
}
