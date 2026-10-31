import type { PayType, DisbursementType } from './employee.types';

export const PayrollRunStatus = {
  Draft: 1,
  Approved: 2,
  Disbursed: 3,
} as const;
export type PayrollRunStatus = (typeof PayrollRunStatus)[keyof typeof PayrollRunStatus];

export interface PayslipDenominationDto {
  note5000: number;
  note1000: number;
  note500: number;
  note100: number;
  note50: number;
  note20: number;
  note10: number;
  coinsRemainder: number;
  totalAmount?: number;
}

export interface PayslipDto {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  category: string;
  payType: PayType;
  disbursementType: DisbursementType;

  // Rates & Earnings
  basicRate: number;
  attendanceAllowance: number;
  otherAllowances: number;
  grossSalary: number;

  // Attendance inputs & additions/deductions
  daysPresent: number;
  absentDays: number;
  absentDeduction: number;
  lateMinutes: number;
  lateDeduction: number;
  nightShiftsCount: number;
  nightShiftMinutes: number;
  nightShiftAmount: number;
  overtimeMinutes: number;
  overtimeAmount: number;

  // Intermediates
  totalDeductions: number;
  dueGrossSalary: number;
  dueGrossSalaryRounded: number;

  // Loans & Advances
  loanDeduction: number;
  advanceSalaryDeduction: number;
  totalLess: number;
  netSalary: number;

  denomination?: PayslipDenominationDto;
}

export interface PayrollRunDto {
  id: string;
  monthYear: string; // "YYYY-MM"
  departmentCategory?: string;
  runDate: string;
  status: PayrollRunStatus;

  employeeCount: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalDueGross: number;
  totalDueGrossRounded: number;
  totalLoansAndAdvances: number;
  totalNetSalary: number;

  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface PayrollRunDetailDto {
  run: PayrollRunDto;
  payslips: PayslipDto[];
  totalDenominations: PayslipDenominationDto;
}

export interface CreatePayrollRunRequest {
  monthYear: string;
  departmentCategory?: string;
  notes?: string;
}

