import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as inventoryApi from "@/api/inventory.api"
import type { InventoryFilters, TransactionFilters, OpeningStockRequest } from "@/types/inventory.types"

export function useGetInventoryList(filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: ["inventory", "list", filters],
    queryFn: () => inventoryApi.getInventoryList(filters),
  })
}

export function useGetTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ["inventory", "transactions", filters],
    queryFn: () => inventoryApi.getTransactions(filters),
  })
}

export function useCreateOpeningStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OpeningStockRequest) => inventoryApi.createOpeningStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      toast.success("Opening stock created successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create opening stock"
      toast.error(message)
    },
  })
}
