import { describe, it, expect } from '@jest/globals';

/**
 * Standard NextGenBytes ERP Payroll Calculation Logic
 */
export function roundToNearestTen(amount: number): number {
  return Math.ceil(amount / 10) * 10;
}

export function computeDueGross(
  grossSalary: number,
  absentDeductions: number,
  lateDeductions: number,
  overtimeAmount: number = 0,
  nightShiftAllowance: number = 0
): number {
  return grossSalary - absentDeductions - lateDeductions + overtimeAmount + nightShiftAllowance;
}

export function computeNetSalary(
  dueGrossRounded: number,
  loanDeduction: number = 0,
  advanceDeduction: number = 0
): number {
  return Math.max(0, dueGrossRounded - loanDeduction - advanceDeduction);
}

describe('Payroll Calculation & Rounding Engine', () => {
  describe('Rounding to Nearest PKR 10 (Bank Cash Handling Rule)', () => {
    it('rounds Rs. 5,940.1 up to Rs. 5,950 for Arsalan Ahmed', () => {
      const rounded = roundToNearestTen(5940.1);
      expect(rounded).toBe(5950);
    });

    it('rounds Rs. 6,031.7 up to Rs. 6,040 for Abdul Aziz Somro', () => {
      const rounded = roundToNearestTen(6031.7);
      expect(rounded).toBe(6040);
    });

    it('preserves amounts that are already exact multiples of 10', () => {
      expect(roundToNearestTen(11000)).toBe(11000);
      expect(roundToNearestTen(80000)).toBe(80000);
      expect(roundToNearestTen(0)).toBe(0);
    });
  });

  describe('Full Pay Computation: August 2026 Dataset', () => {
    it('calculates Arsalan Ahmed (EMP-0001) salary correctly', () => {
      const basicGross = 11000;
      const deductions = 5059.9; // 5060 rounded
      const dueGross = computeDueGross(basicGross, deductions, 0);
      expect(Math.round(dueGross * 10) / 10).toBe(5940.1);

      const dueGrossRounded = roundToNearestTen(dueGross);
      expect(dueGrossRounded).toBe(5950);

      const netSalary = computeNetSalary(dueGrossRounded, 0, 0);
      expect(netSalary).toBe(5950);
    });

    it('calculates Abdul Aziz Somro (EMP-DW-002) salary correctly', () => {
      const basicGross = 10500;
      const deductions = 4468.3;
      const dueGross = computeDueGross(basicGross, deductions, 0);
      expect(Math.round(dueGross * 10) / 10).toBe(6031.7);

      const dueGrossRounded = roundToNearestTen(dueGross);
      expect(dueGrossRounded).toBe(6040);

      const netSalary = computeNetSalary(dueGrossRounded, 0, 0);
      expect(netSalary).toBe(6040);
    });

    it('subtracts loan installments from rounded due gross without negative salary', () => {
      const dueGrossRounded = 50000;
      const loanDeduction = 5000;
      const advanceDeduction = 2000;

      const net = computeNetSalary(dueGrossRounded, loanDeduction, advanceDeduction);
      expect(net).toBe(43000);

      // Edge case: loan exceeds salary -> clamped at 0
      const negativeTest = computeNetSalary(5000, 10000, 0);
      expect(negativeTest).toBe(0);
    });
  });
});
