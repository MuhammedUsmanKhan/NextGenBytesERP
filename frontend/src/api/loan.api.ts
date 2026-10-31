import api from "./axios"
import type { ApiResponse, PagedResponse } from "@/types"
import type {
  LoanAndAdvanceDto,
  CreateLoanRequest,
  UpdateLoanRequest,
  LoanFilterParams,
} from "@/types/loan.types"

export async function getLoans(params?: LoanFilterParams) {
  const response = await api.get<ApiResponse<PagedResponse<LoanAndAdvanceDto>>>("/api/v1/loans", { params })
  return response.data.data
}

export async function getLoanById(id: string) {
  const response = await api.get<ApiResponse<LoanAndAdvanceDto>>(`/api/v1/loans/${id}`)
  return response.data.data
}

export async function createLoan(data: CreateLoanRequest) {
  const response = await api.post<ApiResponse<LoanAndAdvanceDto>>("/api/v1/loans", data)
  return response.data.data
}

export async function updateLoan(id: string, data: UpdateLoanRequest) {
  const response = await api.put<ApiResponse<LoanAndAdvanceDto>>(`/api/v1/loans/${id}`, data)
  return response.data.data
}

export async function deleteLoan(id: string) {
  const response = await api.delete<ApiResponse<boolean>>(`/api/v1/loans/${id}`)
  return response.data.data
}

export async function getActiveLoansForEmployee(employeeId: string) {
  const response = await api.get<ApiResponse<LoanAndAdvanceDto[]>>(`/api/v1/loans/employee/${employeeId}`)
  return response.data.data
}

