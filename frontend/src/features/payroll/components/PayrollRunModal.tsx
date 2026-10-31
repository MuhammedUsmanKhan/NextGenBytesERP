import React, { useState } from "react";
import { X, Play, RefreshCw, Calendar, Tag, FileText } from "lucide-react";
import type { CreatePayrollRunRequest } from "@/types/payroll-run.types";

interface Props {
  onClose: () => void;
  onSubmit: (data: CreatePayrollRunRequest) => void;
  isLoading?: boolean;
}

export const PayrollRunModal: React.FC<Props> = ({
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const currentMonthYear = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [monthYear, setMonthYear] = useState<string>(currentMonthYear);
  const [departmentCategory, setDepartmentCategory] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthYear) return;

    onSubmit({
      monthYear,
      departmentCategory: departmentCategory.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Execute Payroll Run</h2>
              <p className="text-xs text-slate-500">
                Run or recalculate salary formulas, attendance, and loan deductions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              Payroll Month (YYYY-MM) *
            </label>
            <input
              type="month"
              required
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Select the payroll month (e.g. 2026-08 for August 2026).
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
              <Tag className="h-3.5 w-3.5 text-blue-600" />
              Category Filter (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Office Staff, Salaries Labor, Daily Wages (leave blank for all)"
              value={departmentCategory}
              onChange={(e) => setDepartmentCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              Notes / Remarks (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add run notes (e.g. Regular monthly payroll run)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl inline-flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Calculate Payroll
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

