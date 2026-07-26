import api from "./axios"
import type { ApiResponse, PagedResponse } from "@/types"
import type {
  MainCategoryDto,
  SubCategoryDto,
  BrandDto,
  WarehouseDto,
  ProductGroupDto,
  TransporterDto,
  ProductTypeDto,
  UnitDto,
  MainCategoryLookupDto,
  CreateMainCategoryRequest,
  CreateSubCategoryRequest,
  CreateBrandRequest,
  CreateWarehouseRequest,
  CreateProductGroupRequest,
  CreateTransporterRequest,
  CreateProductTypeRequest,
  CreateUnitRequest,
  UpdateMainCategoryRequest,
  UpdateSubCategoryRequest,
  UpdateBrandRequest,
  UpdateWarehouseRequest,
  UpdateProductGroupRequest,
  UpdateTransporterRequest,
  UpdateProductTypeRequest,
  UpdateUnitRequest,
  UpdateStatusRequest,
} from "@/types/definition.types"

const BASE = "/api/v1/definitions"

export interface DefinitionQueryParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  mainCategoryId?: string
}

export async function getMainCategories(params?: DefinitionQueryParams) {
  const response = await api.get<ApiResponse<PagedResponse<MainCategoryDto>>>(`${BASE}/main-categories`, { params })
  return response.data.data
}

export async function createMainCategory(data: CreateMainCategoryRequest) {
  const response = await api.post<ApiResponse<MainCategoryDto>>(`${BASE}/main-categories`, data)
  return response.data.data
}

export async function updateMainCategory(id: string, data: UpdateMainCategoryRequest) {
  const response = await api.put<ApiResponse<MainCategoryDto>>(`${BASE}/main-categories/${id}`, data)
  return response.data.data
}

export async function updateMainCategoryStatus(id: string, data: UpdateStatusRequest) {
  const response = await api.patch<ApiResponse<MainCategoryDto>>(`${BASE}/main-categories/${id}/status`, data)
  return response.data.data
}

export async function deleteMainCategory(id: string) {
  await api.delete(`${BASE}/main-categories/${id}`)
}

export async function getMainCategoryLookup() {
  const response = await api.get<ApiResponse<MainCategoryLookupDto[]>>(`${BASE}/main-categories/lookup`)
  return response.data.data
}

export async function getSubCategories(params?: DefinitionQueryParams) {
  const response = await api.get<ApiResponse<PagedResponse<SubCategoryDto>>>(`${BASE}/sub-categories`, { params })
  return response.data.data
}

export async function createSubCategory(data: CreateSubCategoryRequest) {
  const response = await api.post<ApiResponse<SubCategoryDto>>(`${BASE}/sub-categories`, data)
  return response.data.data
}

export async function updateSubCategory(id: string, data: UpdateSubCategoryRequest) {
  const response = await api.put<ApiResponse<SubCategoryDto>>(`${BASE}/sub-categories/${id}`, data)
  return response.data.data
}

export async function updateSubCategoryStatus(id: string, data: UpdateStatusRequest) {
  const response = await api.patch<ApiResponse<SubCategoryDto>>(`${BASE}/sub-categories/${id}/status`, data)
  return response.data.data
}

export async function deleteSubCategory(id: string) {
  await api.delete(`${BASE}/sub-categories/${id}`)
}

export async function getBrands(params?: DefinitionQueryParams) {
  const response = await api.get<ApiResponse<PagedResponse<BrandDto>>>(`${BASE}/brands`, { params })
  return response.data.data
}

export async function createBrand(data: CreateBrandRequest) {
  const response = await api.post<ApiResponse<BrandDto>>(`${BASE}/brands`, data)
  return response.data.data
}

export async function updateBrand(id: string, data: UpdateBrandRequest) {
  const response = await api.put<ApiResponse<BrandDto>>(`${BASE}/brands/${id}`, data)
  return response.data.data
}

export async function updateBrandStatus(id: string, data: UpdateStatusRequest) {
  const response = await api.patch<ApiResponse<BrandDto>>(`${BASE}/brands/${id}/status`, data)
  return response.data.data
}

export async function deleteBrand(id: string) {
  await api.delete(`${BASE}/brands/${id}`)
}

export async function getWarehouses(params?: DefinitionQueryParams) {
  const response = await api.get<ApiResponse<PagedResponse<WarehouseDto>>>(`${BASE}/warehouses`, { params })
  return response.data.data
}

export async function createWarehouse(data: CreateWarehouseRequest) {
  const response = await api.post<ApiResponse<WarehouseDto>>(`${BASE}/warehouses`, data)
  return response.data.data
}

export async function updateWarehouse(id: string, data: UpdateWarehouseRequest) {
  const response = await api.put<ApiResponse<WarehouseDto>>(`${BASE}/warehouses/${id}`, data)
  return response.data.data
}

export async function updateWarehouseStatus(id: string, data: UpdateStatusRequest) {
  const response = await api.patch<ApiResponse<WarehouseDto>>(`${BASE}/warehouses/${id}/status`, data)
  return response.data.data
}

export async function deleteWarehouse(id: string) {
  await api.delete(`${BASE}/warehouses/${id}`)
}

export async function getProductGroups(params?: DefinitionQueryParams) {
  const response = await api.get<ApiResponse<PagedResponse<ProductGroupDto>>>(`${BASE}/product-groups`, { params })
  return response.data.data
}

export async function createProductGroup(data: CreateProductGroupRequest) {
  const response = await api.post<ApiResponse<ProductGroupDto>>(`${BASE}/product-groups`, data)
  return response.data.data
}

export async function updateProductGroup(id: string, data: UpdateProductGroupRequest) {
  const response = await api.put<ApiResponse<ProductGroupDto>>(`${BASE}/product-groups/${id}`, data)
  return response.data.data
}

export async function updateProductGroupStatus(id: string, data: UpdateStatusRequest) {
  const response = await api.patch<ApiResponse<ProductGroupDto>>(`${BASE}/product-groups/${id}/status`, data)
  return response.data.data
}

export async function deleteProductGroup(id: string) {
  await api.delete(`${BASE}/product-groups/${id}`)
}

export async function getTransporters(params?: DefinitionQueryParams) {
  const response = await api.get<ApiResponse<PagedResponse<TransporterDto>>>(`${BASE}/transporters`, { params })
  return response.data.data
}

export async function createTransporter(data: CreateTransporterRequest) {
  const response = await api.post<ApiResponse<TransporterDto>>(`${BASE}/transporters`, data)
  return response.data.data
}

export async function updateTransporter(id: string, data: UpdateTransporterRequest) {
  const response = await api.put<ApiResponse<TransporterDto>>(`${BASE}/transporters/${id}`, data)
  return response.data.data
}

export async function updateTransporterStatus(id: string, data: UpdateStatusRequest) {
  const response = await api.patch<ApiResponse<TransporterDto>>(`${BASE}/transporters/${id}/status`, data)
  return response.data.data
}

export async function deleteTransporter(id: string) {
  await api.delete(`${BASE}/transporters/${id}`)
}

export async function getProductTypes(params?: DefinitionQueryParams) {
  const response = await api.get<ApiResponse<PagedResponse<ProductTypeDto>>>(`${BASE}/product-types`, { params })
  return response.data.data
}

export async function createProductType(data: CreateProductTypeRequest) {
  const response = await api.post<ApiResponse<ProductTypeDto>>(`${BASE}/product-types`, data)
  return response.data.data
}

export async function updateProductType(id: string, data: UpdateProductTypeRequest) {
  const response = await api.put<ApiResponse<ProductTypeDto>>(`${BASE}/product-types/${id}`, data)
  return response.data.data
}

export async function updateProductTypeStatus(id: string, data: UpdateStatusRequest) {
  const response = await api.patch<ApiResponse<ProductTypeDto>>(`${BASE}/product-types/${id}/status`, data)
  return response.data.data
}

export async function deleteProductType(id: string) {
  await api.delete(`${BASE}/product-types/${id}`)
}

export async function getUnits(params?: DefinitionQueryParams) {
  const response = await api.get<ApiResponse<PagedResponse<UnitDto>>>(`${BASE}/units`, { params })
  return response.data.data
}

export async function createUnit(data: CreateUnitRequest) {
  const response = await api.post<ApiResponse<UnitDto>>(`${BASE}/units`, data)
  return response.data.data
}

export async function updateUnit(id: string, data: UpdateUnitRequest) {
  const response = await api.put<ApiResponse<UnitDto>>(`${BASE}/units/${id}`, data)
  return response.data.data
}

export async function updateUnitStatus(id: string, data: UpdateStatusRequest) {
  const response = await api.patch<ApiResponse<UnitDto>>(`${BASE}/units/${id}/status`, data)
  return response.data.data
}

export async function deleteUnit(id: string) {
  await api.delete(`${BASE}/units/${id}`)
}
