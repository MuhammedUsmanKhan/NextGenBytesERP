import api from "./axios";
import type { ApiResponse, PagedResponse } from "@/types";
import type {
  PayrollRunDto,
  PayrollRunDetailDto,
  CreatePayrollRunRequest,
} from "@/types/payroll-run.types";

export interface PayrollRunFilterParams {
  monthYear?: string;
  page?: number;
  pageSize?: number;
}

export async function getPayrollRuns(params?: PayrollRunFilterParams) {
  const response = await api.get<ApiResponse<PagedResponse<PayrollRunDto>>>("/api/v1/payroll-runs", { params });
  return response.data.data;
}

export async function getPayrollRunById(id: string) {
  const response = await api.get<ApiResponse<PayrollRunDetailDto>>(`/api/v1/payroll-runs/${id}`);
  return response.data.data;
}

export async function createOrRecalculateRun(data: CreatePayrollRunRequest) {
  const response = await api.post<ApiResponse<PayrollRunDetailDto>>("/api/v1/payroll-runs", data);
  return response.data.data;
}

export async function approvePayrollRun(id: string, allowOverride: boolean = false) {
  const response = await api.post<ApiResponse<PayrollRunDto>>(
    `/api/v1/payroll-runs/${id}/approve`,
    null,
    { params: { allowOverride } }
  );
  return response.data.data;
}

export async function deletePayrollRun(id: string) {
  const response = await api.delete<ApiResponse<boolean>>(`/api/v1/payroll-runs/${id}`);
  return response.data.data;
}

