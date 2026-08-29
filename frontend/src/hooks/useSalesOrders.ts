import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as salesOrdersApi from "@/api/sales-orders.api"
import type { SalesOrderQueryParams } from "@/types/sales-order.types"

export function useGetSalesOrders(filters: SalesOrderQueryParams = {}) {
  return useQuery({
    queryKey: ["sales-orders", "list", filters],
    queryFn: () => salesOrdersApi.getSalesOrders(filters),
  })
}

export function useGetSalesOrderById(id: string | null) {
  return useQuery({
    queryKey: ["sales-orders", id],
    queryFn: () => salesOrdersApi.getSalesOrderById(id!),
    enabled: !!id,
  })
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: unknown) => salesOrdersApi.createSalesOrder(data as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      toast.success("Sales Order created successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create Sales Order"
      toast.error(message)
    },
  })
}

export function useUpdateSalesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      salesOrdersApi.updateSalesOrder(id, data as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      toast.success("Sales Order updated successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update Sales Order"
      toast.error(message)
    },
  })
}

export function useCloseSalesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salesOrdersApi.closeSalesOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      toast.success("Sales Order closed successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to close Sales Order"
      toast.error(message)
    },
  })
}

export function useDeleteSalesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salesOrdersApi.deleteSalesOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      toast.success("Sales Order deleted successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete Sales Order"
      toast.error(message)
    },
  })
}
