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
  VendorDto,
  CustomerDto,
  MainCategoryLookupDto,
  CreateMainCategoryRequest,
  CreateSubCategoryRequest,
  CreateBrandRequest,
  CreateWarehouseRequest,
  CreateProductGroupRequest,
  CreateTransporterRequest,
  CreateProductTypeRequest,
  CreateUnitRequest,
  CreateVendorRequest,
  CreateCustomerRequest,
  UpdateMainCategoryRequest,
  UpdateSubCategoryRequest,
  UpdateBrandRequest,
  UpdateWarehouseRequest,
  UpdateProductGroupRequest,
  UpdateTransporterRequest,
  UpdateProductTypeRequest,
  UpdateUnitRequest,
  UpdateVendorRequest,
  UpdateCustomerRequest,
  UpdateStatusRequest,
  NextCodeResponse,
  NextVendorCodeResponse,
  NextCustomerCodeResponse,
  DepartmentDto,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
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

export async function getVendors(params?: DefinitionQueryParams) {
  const response = await api.get<ApiResponse<PagedResponse<VendorDto>>>(`${BASE}/vendors`, { params })
  return response.data.data
}

export async function getNextVendorCode() {
  const response = await api.get<ApiResponse<NextVendorCodeResponse>>(`${BASE}/vendors/next-code`)
  return response.data.data
}

export async function getNextMainCategoryCode() {
  const response = await api.get<ApiResponse<NextCodeResponse>>(`${BASE}/main-categories/next-code`)
  return response.data.data
}

export async function getNextSubCategoryCode() {
  const response = await api.get<ApiResponse<NextCodeResponse>>(`${BASE}/sub-categories/next-code`)
  return response.data.data
}

export async function getNextBrandCode() {
  const response = await api.get<ApiResponse<NextCodeResponse>>(`${BASE}/brands/next-code`)
  return response.data.data
}

export async function getNextWarehouseCode() {
  const response = await api.get<ApiResponse<NextCodeResponse>>(`${BASE}/warehouses/next-code`)
  return response.data.data
}

export async function getNextTransporterCode() {
  const response = await api.get<ApiResponse<NextCodeResponse>>(`${BASE}/transporters/next-code`)
  return response.data.data
}

export async function getNextProductGroupCode() {
  const response = await api.get<ApiResponse<NextCodeResponse>>(`${BASE}/product-groups/next-code`)
  return response.data.data
}

export async function createVendor(data: CreateVendorRequest) {
  const response = await api.post<ApiResponse<VendorDto>>(`${BASE}/vendors`, data)
  return response.data.data
}

export async function updateVendor(id: string, data: UpdateVendorRequest) {
  const response = await api.put<ApiResponse<VendorDto>>(`${BASE}/vendors/${id}`, data)
  return response.data.data
}

export async function updateVendorStatus(id: string, data: UpdateStatusRequest) {
  const response = await api.patch<ApiResponse<VendorDto>>(`${BASE}/vendors/${id}/status`, data)
  return response.data.data
}

export async function deleteVendor(id: string) {
  await api.delete(`${BASE}/vendors/${id}`)
}

export async function getCustomers(params?: DefinitionQueryParams) {
  const response = await api.get<ApiResponse<PagedResponse<CustomerDto>>>(`${BASE}/customers`, { params })
  return response.data.data
}

export async function getNextCustomerCode() {
  const response = await api.get<ApiResponse<NextCustomerCodeResponse>>(`${BASE}/customers/next-code`)
  return response.data.data
}

export async function createCustomer(data: CreateCustomerRequest) {
  const response = await api.post<ApiResponse<CustomerDto>>(`${BASE}/customers`, data)
  return response.data.data
}

export async function updateCustomer(id: string, data: UpdateCustomerRequest) {
  const response = await api.put<ApiResponse<CustomerDto>>(`${BASE}/customers/${id}`, data)
  return response.data.data
}

export async function updateCustomerStatus(id: string, data: UpdateStatusRequest) {
  const response = await api.patch<ApiResponse<CustomerDto>>(`${BASE}/customers/${id}/status`, data)
  return response.data.data
}

export async function deleteCustomer(id: string) {
  await api.delete(`${BASE}/customers/${id}`)
}

export async function getDepartments(params?: DefinitionQueryParams) {
  const response = await api.get<ApiResponse<PagedResponse<DepartmentDto>>>(`${BASE}/departments`, { params })
  return response.data.data
}

export async function getNextDepartmentCode() {
  const response = await api.get<ApiResponse<NextCodeResponse>>(`${BASE}/departments/next-code`)
  return response.data.data
}

export async function createDepartment(data: CreateDepartmentRequest) {
  const response = await api.post<ApiResponse<DepartmentDto>>(`${BASE}/departments`, data)
  return response.data.data
}

export async function updateDepartment(id: string, data: UpdateDepartmentRequest) {
  const response = await api.put<ApiResponse<DepartmentDto>>(`${BASE}/departments/${id}`, data)
  return response.data.data
}

export async function updateDepartmentStatus(id: string, data: UpdateStatusRequest) {
  const response = await api.patch<ApiResponse<DepartmentDto>>(`${BASE}/departments/${id}/status`, data)
  return response.data.data
}

export async function deleteDepartment(id: string) {
  await api.delete(`${BASE}/departments/${id}`)
}
