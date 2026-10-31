export const PayType = {
  Monthly: 1,
  DailyWage: 2,
} as const
export type PayType = (typeof PayType)[keyof typeof PayType]

export const DisbursementType = {
  Cash: 1,
  BankTransfer: 2,
} as const
export type DisbursementType = (typeof DisbursementType)[keyof typeof DisbursementType]

export const AbsencePolicy = {
  StandardFullDeduction: 1,
  FirstDayFree_DeductRemaining: 2,
  ThresholdGrace_DeductAllIfExceeded: 3,
} as const
export type AbsencePolicy = (typeof AbsencePolicy)[keyof typeof AbsencePolicy]

export const RoundingMode = {
  None: 0,
  Nearest10: 1,
  Ceiling10: 2,
} as const
export type RoundingMode = (typeof RoundingMode)[keyof typeof RoundingMode]

export interface EmployeeContractDto {
  id: string
  employeeId: string
  payType: PayType
  disbursementType: DisbursementType
  basicRate: number
  attendanceAllowance: number
  otherAllowances: number
  monthlyDivisorDays: number
  dailyShiftHours: number
  nightShiftMinutes: number
  absencePolicy: AbsencePolicy
  graceAbsentDays: number
  overtimeEligible: boolean
  overtimeMultiplier: number
  roundingMode: RoundingMode
  bankName: string | null
  bankAccountNumber: string | null
  effectiveFrom: string
  effectiveTo: string | null
  isActive: boolean
  createdAt: string
}

export interface EmployeeDto {
  id: string
  code: string
  fullName: string
  cnic: string | null
  phone: string | null
  departmentId: string | null
  departmentName: string | null
  designation: string | null
  biometricDeviceId?: string | null
  shiftDefinitionId?: string | null
  shiftName?: string | null
  category: string
  dateOfJoining: string | null
  status: "Active" | "Inactive" | "Terminated"
  activeContract: EmployeeContractDto | null
  createdAt: string
}

export interface CreateEmployeeRequest {
  code?: string
  fullName: string
  cnic?: string
  phone?: string
  departmentId?: string
  designation?: string
  biometricDeviceId?: string
  shiftDefinitionId?: string
  category: string
  dateOfJoining?: string
  status?: string

  // Initial contract
  createContract?: boolean
  payType?: PayType
  disbursementType?: DisbursementType
  basicRate?: number
  attendanceAllowance?: number
  otherAllowances?: number
  monthlyDivisorDays?: number
  dailyShiftHours?: number
  nightShiftMinutes?: number
  absencePolicy?: AbsencePolicy
  graceAbsentDays?: number
  overtimeEligible?: boolean
  overtimeMultiplier?: number
  roundingMode?: RoundingMode
  bankName?: string
  bankAccountNumber?: string
  effectiveFrom?: string
}

export interface UpdateEmployeeRequest {
  fullName: string
  cnic?: string
  phone?: string
  departmentId?: string
  designation?: string
  biometricDeviceId?: string
  shiftDefinitionId?: string
  category: string
  dateOfJoining?: string
  status: string
}

export interface CreateContractRequest {
  payType: PayType
  disbursementType: DisbursementType
  basicRate: number
  attendanceAllowance?: number
  otherAllowances?: number
  monthlyDivisorDays?: number
  dailyShiftHours?: number
  nightShiftMinutes?: number
  absencePolicy?: AbsencePolicy
  graceAbsentDays?: number
  overtimeEligible?: boolean
  overtimeMultiplier?: number
  roundingMode?: RoundingMode
  bankName?: string
  bankAccountNumber?: string
  effectiveFrom?: string
}

export interface EmployeeFilters {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  departmentId?: string
  status?: string
}

