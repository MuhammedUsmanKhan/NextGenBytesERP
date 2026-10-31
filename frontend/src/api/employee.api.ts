import api from "./axios"
import type { ApiResponse, PagedResponse } from "@/types"
import type {
  EmployeeDto,
  EmployeeContractDto,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  CreateContractRequest,
  EmployeeFilters,
} from "@/types/employee.types"

export async function getEmployees(params?: EmployeeFilters) {
  const response = await api.get<ApiResponse<PagedResponse<EmployeeDto>>>("/api/v1/employees", { params })
  return response.data.data
}

export async function getEmployeeById(id: string) {
  const response = await api.get<ApiResponse<EmployeeDto>>(`/api/v1/employees/${id}`)
  return response.data.data
}

export async function createEmployee(data: CreateEmployeeRequest) {
  const response = await api.post<ApiResponse<EmployeeDto>>("/api/v1/employees", data)
  return response.data.data
}

export async function updateEmployee(id: string, data: UpdateEmployeeRequest) {
  const response = await api.put<ApiResponse<EmployeeDto>>(`/api/v1/employees/${id}`, data)
  return response.data.data
}

export async function deleteEmployee(id: string) {
  const response = await api.delete<ApiResponse<boolean>>(`/api/v1/employees/${id}`)
  return response.data.data
}

export async function addContract(employeeId: string, data: CreateContractRequest) {
  const response = await api.post<ApiResponse<EmployeeContractDto>>(`/api/v1/employees/${employeeId}/contracts`, data)
  return response.data.data
}

export async function getContracts(employeeId: string) {
  const response = await api.get<ApiResponse<EmployeeContractDto[]>>(`/api/v1/employees/${employeeId}/contracts`)
  return response.data.data
}

