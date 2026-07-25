import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as definitionsApi from "@/api/definitions.api"
import * as definitionsTypes from "@/types/definition.types"
import type { DefinitionTab, DefinitionDto } from "@/types/definition.types"
import type { PagedResponse } from "@/types"
import type { DefinitionQueryParams } from "@/api/definitions.api"

type EntityConfig = {
  queryKey: string[]
  getAll: (params: DefinitionQueryParams) => Promise<PagedResponse<DefinitionDto>>
  create: (data: unknown) => Promise<DefinitionDto>
  update: (args: { id: string; data: unknown }) => Promise<DefinitionDto>
  updateStatus: (args: { id: string; status: "Active" | "Inactive" }) => Promise<DefinitionDto>
  delete: (id: string) => Promise<void>
}

const entityConfigs: Record<DefinitionTab, EntityConfig> = {
  "main-categories": {
    queryKey: ["definitions", "main-categories"],
    getAll: (params) => definitionsApi.getMainCategories(params) as Promise<PagedResponse<DefinitionDto>>,
    create: (data) => definitionsApi.createMainCategory(data as definitionsTypes.CreateMainCategoryRequest),
    update: ({ id, data }) => definitionsApi.updateMainCategory(id, data as definitionsTypes.UpdateMainCategoryRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateMainCategoryStatus(id, { status }),
    delete: (id) => definitionsApi.deleteMainCategory(id),
  },
  "sub-categories": {
    queryKey: ["definitions", "sub-categories"],
    getAll: (params) => definitionsApi.getSubCategories(params) as Promise<PagedResponse<DefinitionDto>>,
    create: (data) => definitionsApi.createSubCategory(data as definitionsTypes.CreateSubCategoryRequest),
    update: ({ id, data }) => definitionsApi.updateSubCategory(id, data as definitionsTypes.UpdateSubCategoryRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateSubCategoryStatus(id, { status }),
    delete: (id) => definitionsApi.deleteSubCategory(id),
  },
  brands: {
    queryKey: ["definitions", "brands"],
    getAll: (params) => definitionsApi.getBrands(params) as Promise<PagedResponse<DefinitionDto>>,
    create: (data) => definitionsApi.createBrand(data as definitionsTypes.CreateBrandRequest),
    update: ({ id, data }) => definitionsApi.updateBrand(id, data as definitionsTypes.UpdateBrandRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateBrandStatus(id, { status }),
    delete: (id) => definitionsApi.deleteBrand(id),
  },
  warehouses: {
    queryKey: ["definitions", "warehouses"],
    getAll: (params) => definitionsApi.getWarehouses(params) as Promise<PagedResponse<DefinitionDto>>,
    create: (data) => definitionsApi.createWarehouse(data as definitionsTypes.CreateWarehouseRequest),
    update: ({ id, data }) => definitionsApi.updateWarehouse(id, data as definitionsTypes.UpdateWarehouseRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateWarehouseStatus(id, { status }),
    delete: (id) => definitionsApi.deleteWarehouse(id),
  },
  "product-groups": {
    queryKey: ["definitions", "product-groups"],
    getAll: (params) => definitionsApi.getProductGroups(params) as Promise<PagedResponse<DefinitionDto>>,
    create: (data) => definitionsApi.createProductGroup(data as definitionsTypes.CreateProductGroupRequest),
    update: ({ id, data }) => definitionsApi.updateProductGroup(id, data as definitionsTypes.UpdateProductGroupRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateProductGroupStatus(id, { status }),
    delete: (id) => definitionsApi.deleteProductGroup(id),
  },
  transporters: {
    queryKey: ["definitions", "transporters"],
    getAll: (params) => definitionsApi.getTransporters(params) as Promise<PagedResponse<DefinitionDto>>,
    create: (data) => definitionsApi.createTransporter(data as definitionsTypes.CreateTransporterRequest),
    update: ({ id, data }) => definitionsApi.updateTransporter(id, data as definitionsTypes.UpdateTransporterRequest),
    updateStatus: ({ id, status }) => definitionsApi.updateTransporterStatus(id, { status }),
    delete: (id) => definitionsApi.deleteTransporter(id),
  },
}

export function useDefinitionList(tab: DefinitionTab, params: DefinitionQueryParams = {}) {
  const config = entityConfigs[tab]
  return useQuery({
    queryKey: [...config.queryKey, params],
    queryFn: () => config.getAll(params),
  })
}

export function useCreateDefinition(tab: DefinitionTab) {
  const queryClient = useQueryClient()
  const config = entityConfigs[tab]

  return useMutation({
    mutationFn: (data: unknown) => config.create(data),
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
    mutationFn: ({ id, data }: { id: string; data: unknown }) => config.update({ id, data }),
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
      config.updateStatus({ id, status }),
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
