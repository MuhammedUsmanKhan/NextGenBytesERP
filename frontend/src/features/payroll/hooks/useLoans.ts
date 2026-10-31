import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
  getActiveLoansForEmployee,
} from "@/api/loan.api"
import type { CreateLoanRequest, UpdateLoanRequest, LoanFilterParams } from "@/types/loan.types"

const QUERY_KEY = "loans"

export function useLoans(params?: LoanFilterParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getLoans(params),
  })
}

export function useLoan(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => (id ? getLoanById(id) : null),
    enabled: Boolean(id),
  })
}

export function useActiveEmployeeLoans(employeeId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, "employee", employeeId],
    queryFn: () => (employeeId ? getActiveLoansForEmployee(employeeId) : []),
    enabled: Boolean(employeeId),
  })
}

export function useCreateLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLoanRequest) => createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success("Disbursed successfully")
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to disburse"
      toast.error(msg)
    },
  })
}

export function useUpdateLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLoanRequest }) => updateLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success("Loan updated successfully")
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to update loan"
      toast.error(msg)
    },
  })
}

export function useDeleteLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success("Record deleted successfully")
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to delete record"
      toast.error(msg)
    },
  })
}

