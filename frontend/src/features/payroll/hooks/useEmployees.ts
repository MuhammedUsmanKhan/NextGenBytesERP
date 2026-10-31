import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  addContract,
  getContracts,
} from "@/api/employee.api"
import type {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  CreateContractRequest,
  EmployeeFilters,
} from "@/types/employee.types"

const QUERY_KEY = "employees"

export function useEmployeeList(params?: EmployeeFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getEmployees(params),
  })
}

export function useEmployee(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => (id ? getEmployeeById(id) : null),
    enabled: Boolean(id),
  })
}

export function useEmployeeContracts(employeeId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, employeeId, "contracts"],
    queryFn: () => (employeeId ? getContracts(employeeId) : []),
    enabled: Boolean(employeeId),
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success("Employee created successfully")
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to create employee"
      toast.error(msg)
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) => updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success("Employee updated successfully")
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to update employee"
      toast.error(msg)
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success("Employee deleted successfully")
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to delete employee"
      toast.error(msg)
    },
  })
}

export function useAddContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: string; data: CreateContractRequest }) =>
      addContract(employeeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.employeeId, "contracts"] })
      toast.success("Contract updated successfully")
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to update contract"
      toast.error(msg)
    },
  })
}

