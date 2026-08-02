import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as productsApi from "@/api/products.api"
import type { ProductFilters } from "@/types/product.types"

export function useGetProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", "list", filters],
    queryFn: () => productsApi.getProducts(filters),
  })
}

export function useGetProductById(id: string | null) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productsApi.getProductById(id!),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: unknown) => productsApi.createProduct(data as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product created successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create product"
      toast.error(message)
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      productsApi.updateProduct(id, data as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product updated successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update product"
      toast.error(message)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product deleted successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete product"
      toast.error(message)
    },
  })
}

export function useGetNextProductCode(productTypeId: string | null) {
  return useQuery({
    queryKey: ["products", "next-code", productTypeId],
    queryFn: () => productsApi.getNextProductCode(productTypeId!),
    enabled: !!productTypeId,
    staleTime: 0,
  })
}
