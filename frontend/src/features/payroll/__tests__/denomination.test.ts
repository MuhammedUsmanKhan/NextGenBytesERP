import { describe, it, expect } from '@jest/globals';

/**
 * Greedy PKR note denomination breakdown algorithm implemented in the ERP engine.
 * Currency denominations: 5000, 1000, 500, 100, 50, 20, 10, and remainder coins.
 */
export function calculatePkrDenominations(amount: number) {
  let remaining = Math.max(0, Math.floor(amount));
  const note5000 = Math.floor(remaining / 5000);
  remaining %= 5000;

  const note1000 = Math.floor(remaining / 1000);
  remaining %= 1000;

  const note500 = Math.floor(remaining / 500);
  remaining %= 500;

  const note100 = Math.floor(remaining / 100);
  remaining %= 100;

  const note50 = Math.floor(remaining / 50);
  remaining %= 50;

  const note20 = Math.floor(remaining / 20);
  remaining %= 20;

  const note10 = Math.floor(remaining / 10);
  remaining %= 10;

  const coinsRemainder = remaining;

  return {
    note5000,
    note1000,
    note500,
    note100,
    note50,
    note20,
    note10,
    coinsRemainder,
    totalValue:
      note5000 * 5000 +
      note1000 * 1000 +
      note500 * 500 +
      note100 * 100 +
      note50 * 50 +
      note20 * 20 +
      note10 * 10 +
      coinsRemainder,
  };
}

describe('PKR Bank Cash Denomination Engine', () => {
  describe('Individual Employee Cash Slips (August 2026 Production Dataset)', () => {
    it('should correctly calculate notes for Arsalan Ahmed (EMP-0001, Net: Rs. 5,950)', () => {
      const denom = calculatePkrDenominations(5950);
      expect(denom.note5000).toBe(1);
      expect(denom.note1000).toBe(0);
      expect(denom.note500).toBe(1);
      expect(denom.note100).toBe(4);
      expect(denom.note50).toBe(1);
      expect(denom.note20).toBe(0);
      expect(denom.note10).toBe(0);
      expect(denom.coinsRemainder).toBe(0);
      expect(denom.totalValue).toBe(5950);
    });

    it('should correctly calculate notes for Abdul Aziz Somro (EMP-DW-002, Net: Rs. 6,040)', () => {
      const denom = calculatePkrDenominations(6040);
      expect(denom.note5000).toBe(1);
      expect(denom.note1000).toBe(1);
      expect(denom.note500).toBe(0);
      expect(denom.note100).toBe(0);
      expect(denom.note50).toBe(0);
      expect(denom.note20).toBe(2);
      expect(denom.note10).toBe(0);
      expect(denom.coinsRemainder).toBe(0);
      expect(denom.totalValue).toBe(6040);
    });

    it('should handle zero net salary for inactive / zero-day employee (AB Baloch EMP-DW-001, Net: Rs. 0)', () => {
      const denom = calculatePkrDenominations(0);
      expect(denom.note5000).toBe(0);
      expect(denom.note1000).toBe(0);
      expect(denom.note500).toBe(0);
      expect(denom.note100).toBe(0);
      expect(denom.note50).toBe(0);
      expect(denom.note20).toBe(0);
      expect(denom.note10).toBe(0);
      expect(denom.coinsRemainder).toBe(0);
      expect(denom.totalValue).toBe(0);
    });
  });

  describe('Month-Wide Bank Cash Requisition Summary (August 2026)', () => {
    it('should verify direct greedy PKR breakdown for total net payable Rs. 471,880', () => {
      const denom = calculatePkrDenominations(471880);
      expect(denom.totalValue).toBe(471880);
      expect(denom.coinsRemainder).toBe(0);
      expect(denom.note5000).toBe(94);
      expect(denom.note1000).toBe(1);
      expect(denom.note500).toBe(1);
      expect(denom.note100).toBe(3);
      expect(denom.note50).toBe(1);
      expect(denom.note20).toBe(1);
      expect(denom.note10).toBe(1);
    });

    it('should aggregate individual employee cash slips such that total cash equals sum of net salaries', () => {
      const sampleSlips = [
        { name: 'Arsalan Ahmed', net: 5950 },
        { name: 'Abdul Aziz Somro', net: 6040 },
        { name: 'AB Baloch', net: 0 },
        { name: 'Worker 4', net: 25000 },
        { name: 'Worker 5', net: 18450 },
      ];

      const denoms = sampleSlips.map((s) => calculatePkrDenominations(s.net));
      const totalCashValue = denoms.reduce((acc, d) => acc + d.totalValue, 0);
      const expectedTotal = sampleSlips.reduce((acc, s) => acc + s.net, 0);

      expect(totalCashValue).toBe(expectedTotal);
      expect(totalCashValue).toBe(55440);
    });
  });

  describe('Edge Cases & Currency Anomalies', () => {
    it('should isolate non-rounded coin change when gross rounding is bypassed', () => {
      const denom = calculatePkrDenominations(12347);
      expect(denom.note5000).toBe(2); // 10000
      expect(denom.note1000).toBe(2); // 2000
      expect(denom.note500).toBe(0);
      expect(denom.note100).toBe(3);  // 300
      expect(denom.note50).toBe(0);
      expect(denom.note20).toBe(2);   // 40
      expect(denom.note10).toBe(0);
      expect(denom.coinsRemainder).toBe(7); // 7 PKR change
      expect(denom.totalValue).toBe(12347);
    });

    it('should gracefully handle negative or invalid numeric inputs without exploding', () => {
      const denom = calculatePkrDenominations(-5000);
      expect(denom.totalValue).toBe(0);
      expect(denom.note5000).toBe(0);
      expect(denom.coinsRemainder).toBe(0);
    });
  });
});
