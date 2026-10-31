import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPayrollRuns,
  getPayrollRunById,
  createOrRecalculateRun,
  approvePayrollRun,
  deletePayrollRun,
  type PayrollRunFilterParams,
} from "@/api/payroll-run.api";
import type { CreatePayrollRunRequest } from "@/types/payroll-run.types";

const QUERY_KEY = "payroll-runs";

export function usePayrollRuns(params?: PayrollRunFilterParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPayrollRuns(params),
  });
}

export function usePayrollRun(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => (id ? getPayrollRunById(id) : null),
    enabled: Boolean(id),
  });
}

export function useCreateOrRecalculateRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePayrollRunRequest) => createOrRecalculateRun(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast.success(
        res?.run.status === 2
          ? "Payroll run updated"
          : `Payroll calculated for ${res?.run.employeeCount ?? 0} employees`
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to calculate payroll";
      toast.error(msg);
    },
  });
}

export function useApprovePayrollRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; allowOverride?: boolean } | string) => {
      const id = typeof vars === "string" ? vars : vars.id;
      const allowOverride = typeof vars === "string" ? false : Boolean(vars.allowOverride);
      return approvePayrollRun(id, allowOverride);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast.success("Payroll run locked and approved! Loans and advances balances deducted.");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to approve payroll run";
      toast.error(msg);
    },
  });
}

export function useDeletePayrollRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePayrollRun(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Draft payroll run deleted");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to delete payroll run";
      toast.error(msg);
    },
  });
}

