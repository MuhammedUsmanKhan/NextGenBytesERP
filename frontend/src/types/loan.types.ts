export const LoanType = {
  Loan: 1,
  SalaryAdvance: 2,
} as const
export type LoanType = (typeof LoanType)[keyof typeof LoanType]

export const LoanStatus = {
  Active: 1,
  Closed: 2,
  Suspended: 3,
} as const
export type LoanStatus = (typeof LoanStatus)[keyof typeof LoanStatus]

export interface LoanAndAdvanceDto {
  id: string
  employeeId: string
  employeeCode: string
  employeeName: string
  category: string
  departmentName: string | null
  type: LoanType
  totalAmount: number
  monthlyDeduction: number
  remainingBalance: number
  repaidAmount: number
  disbursedDate: string
  status: LoanStatus
  notes: string | null
  createdAt: string
}

export interface CreateLoanRequest {
  employeeId: string
  type: LoanType
  totalAmount: number
  monthlyDeduction?: number
  disbursedDate?: string
  notes?: string
}

export interface UpdateLoanRequest {
  monthlyDeduction: number
  remainingBalance?: number
  status: LoanStatus
  notes?: string
}

export interface LoanFilterParams {
  employeeId?: string
  type?: LoanType
  status?: LoanStatus
  page?: number
  pageSize?: number
}

