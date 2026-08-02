import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as definitionsApi from "@/api/definitions.api"
import * as definitionsTypes from "@/types/definition.types"
import type { DefinitionTab } from "@/types/definition.types"
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
  DefinitionDto,
} from "@/types/definition.types"
import type { PagedResponse } from "@/types"
import type { DefinitionQueryParams } from "@/api/definitions.api"

type DefinitionTabMap = {
  "main-categories": MainCategoryDto
  "sub-categories": SubCategoryDto
  brands: BrandDto
  warehouses: WarehouseDto
  "product-groups": ProductGroupDto
  transporters: TransporterDto
  "product-types": ProductTypeDto
  units: UnitDto
  vendors: VendorDto
}

type EntityConfig<T> = {
  queryKey: string[]
  getAll: (params: DefinitionQueryParams) => Promise<PagedResponse<T>>
  create: (data: unknown) => Promise<T>
  update: (args: { id: string; data: unknown }) => Promise<T>
  updateStatus: (args: { id: string; status: "Active" | "Inactive" }) => Promise<T>
  delete: (id: string) => Promise<void>
}

const entityConfigs = {
  "main-categories": {
    queryKey: ["definitions", "main-categories"],
    getAll: (params) => definitionsApi.getMainCategories(params),
    create: (data) => definitionsApi.createMainCategory(data as definitionsTypes.CreateMainCategoryRequest),
    update: ({ id, data }) => definitionsApi.updateMainCategory(id, data as definitionsTypes.UpdateMainCategoryRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateMainCategoryStatus(id, { status }),
    delete: (id) => definitionsApi.deleteMainCategory(id),
  } satisfies EntityConfig<MainCategoryDto>,
  "sub-categories": {
    queryKey: ["definitions", "sub-categories"],
    getAll: (params) => definitionsApi.getSubCategories(params),
    create: (data) => definitionsApi.createSubCategory(data as definitionsTypes.CreateSubCategoryRequest),
    update: ({ id, data }) => definitionsApi.updateSubCategory(id, data as definitionsTypes.UpdateSubCategoryRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateSubCategoryStatus(id, { status }),
    delete: (id) => definitionsApi.deleteSubCategory(id),
  } satisfies EntityConfig<SubCategoryDto>,
  brands: {
    queryKey: ["definitions", "brands"],
    getAll: (params) => definitionsApi.getBrands(params),
    create: (data) => definitionsApi.createBrand(data as definitionsTypes.CreateBrandRequest),
    update: ({ id, data }) => definitionsApi.updateBrand(id, data as definitionsTypes.UpdateBrandRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateBrandStatus(id, { status }),
    delete: (id) => definitionsApi.deleteBrand(id),
  } satisfies EntityConfig<BrandDto>,
  warehouses: {
    queryKey: ["definitions", "warehouses"],
    getAll: (params) => definitionsApi.getWarehouses(params),
    create: (data) => definitionsApi.createWarehouse(data as definitionsTypes.CreateWarehouseRequest),
    update: ({ id, data }) => definitionsApi.updateWarehouse(id, data as definitionsTypes.UpdateWarehouseRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateWarehouseStatus(id, { status }),
    delete: (id) => definitionsApi.deleteWarehouse(id),
  } satisfies EntityConfig<WarehouseDto>,
  "product-groups": {
    queryKey: ["definitions", "product-groups"],
    getAll: (params) => definitionsApi.getProductGroups(params),
    create: (data) => definitionsApi.createProductGroup(data as definitionsTypes.CreateProductGroupRequest),
    update: ({ id, data }) => definitionsApi.updateProductGroup(id, data as definitionsTypes.UpdateProductGroupRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateProductGroupStatus(id, { status }),
    delete: (id) => definitionsApi.deleteProductGroup(id),
  } satisfies EntityConfig<ProductGroupDto>,
  transporters: {
    queryKey: ["definitions", "transporters"],
    getAll: (params) => definitionsApi.getTransporters(params),
    create: (data) => definitionsApi.createTransporter(data as definitionsTypes.CreateTransporterRequest),
    update: ({ id, data }) => definitionsApi.updateTransporter(id, data as definitionsTypes.UpdateTransporterRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateTransporterStatus(id, { status }),
    delete: (id) => definitionsApi.deleteTransporter(id),
  } satisfies EntityConfig<TransporterDto>,
  "product-types": {
    queryKey: ["definitions", "product-types"],
    getAll: (params) => definitionsApi.getProductTypes(params),
    create: (data) => definitionsApi.createProductType(data as definitionsTypes.CreateProductTypeRequest),
    update: ({ id, data }) => definitionsApi.updateProductType(id, data as definitionsTypes.UpdateProductTypeRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateProductTypeStatus(id, { status }),
    delete: (id) => definitionsApi.deleteProductType(id),
  } satisfies EntityConfig<ProductTypeDto>,
  units: {
    queryKey: ["definitions", "units"],
    getAll: (params) => definitionsApi.getUnits(params),
    create: (data) => definitionsApi.createUnit(data as definitionsTypes.CreateUnitRequest),
    update: ({ id, data }) => definitionsApi.updateUnit(id, data as definitionsTypes.UpdateUnitRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateUnitStatus(id, { status }),
    delete: (id) => definitionsApi.deleteUnit(id),
  } satisfies EntityConfig<UnitDto>,
  vendors: {
    queryKey: ["definitions", "vendors"],
    getAll: (params) => definitionsApi.getVendors(params),
    create: (data) => definitionsApi.createVendor(data as definitionsTypes.CreateVendorRequest),
    update: ({ id, data }) => definitionsApi.updateVendor(id, data as definitionsTypes.UpdateVendorRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateVendorStatus(id, { status }),
    delete: (id) => definitionsApi.deleteVendor(id),
  } satisfies EntityConfig<VendorDto>,
}

export function useDefinitionList<T extends DefinitionTab>(tab: T, params: DefinitionQueryParams = {}, enabled = true) {
  type Dto = DefinitionTabMap[T]
  const config = entityConfigs[tab] as unknown as EntityConfig<Dto>
  return useQuery<PagedResponse<Dto>>({
    queryKey: [...config.queryKey, params],
    queryFn: () => config.getAll(params),
    enabled,
  })
}

export function useCreateDefinition(tab: DefinitionTab) {
  const queryClient = useQueryClient()
  const config = entityConfigs[tab]

  return useMutation({
    mutationFn: (data: unknown) => config.create(data) as Promise<DefinitionDto>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey })
      toast.success("Item created successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create item"
      toast.error(message)
    },
  })
}

export function useUpdateDefinition(tab: DefinitionTab) {
  const queryClient = useQueryClient()
  const config = entityConfigs[tab]

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => config.update({ id, data }) as Promise<DefinitionDto>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey })
      toast.success("Item updated successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update item"
      toast.error(message)
    },
  })
}

export function useUpdateDefinitionStatus(tab: DefinitionTab) {
  const queryClient = useQueryClient()
  const config = entityConfigs[tab]

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Active" | "Inactive" }) =>
      config.updateStatus({ id, status }) as Promise<DefinitionDto>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey })
      toast.success("Status updated successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update status"
      toast.error(message)
    },
  })
}

export function useDeleteDefinition(tab: DefinitionTab) {
  const queryClient = useQueryClient()
  const config = entityConfigs[tab]

  return useMutation({
    mutationFn: (id: string) => config.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey })
      toast.success("Item deleted successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete item"
      toast.error(message)
    },
  })
}

export function useMainCategoryLookup() {
  return useQuery({
    queryKey: ["definitions", "main-categories", "lookup"],
    queryFn: definitionsApi.getMainCategoryLookup,
  })
}

export function useNextMainCategoryCode() {
  return useQuery({
    queryKey: ["definitions", "main-categories", "next-code"],
    queryFn: definitionsApi.getNextMainCategoryCode,
    staleTime: 0,
  })
}

export function useNextSubCategoryCode() {
  return useQuery({
    queryKey: ["definitions", "sub-categories", "next-code"],
    queryFn: definitionsApi.getNextSubCategoryCode,
    staleTime: 0,
  })
}

export function useNextBrandCode() {
  return useQuery({
    queryKey: ["definitions", "brands", "next-code"],
    queryFn: definitionsApi.getNextBrandCode,
    staleTime: 0,
  })
}

export function useNextWarehouseCode() {
  return useQuery({
    queryKey: ["definitions", "warehouses", "next-code"],
    queryFn: definitionsApi.getNextWarehouseCode,
    staleTime: 0,
  })
}

export function useNextTransporterCode() {
  return useQuery({
    queryKey: ["definitions", "transporters", "next-code"],
    queryFn: definitionsApi.getNextTransporterCode,
    staleTime: 0,
  })
}

export function useNextProductGroupCode() {
  return useQuery({
    queryKey: ["definitions", "product-groups", "next-code"],
    queryFn: definitionsApi.getNextProductGroupCode,
    staleTime: 0,
  })
}

export function useNextVendorCode() {
  return useQuery({
    queryKey: ["definitions", "vendors", "next-code"],
    queryFn: definitionsApi.getNextVendorCode,
    staleTime: 0,
  })
}
