import { describe, expect, test } from 'bun:test';
import { effectivePrice, pctHundredths, ruleFor, surplusFor, type SurplusInput } from '../src/services/surplus';

const base: SurplusInput = {
  basePrice: 14000,
  floorPrice: null,
  surplusEnabled: true,
  rules: [
    { daysRemaining: 3, discountPct: '10' },
    { daysRemaining: 2, discountPct: '25' },
    { daysRemaining: 1, discountPct: '40' },
  ],
  daysLeft: 3,
  stock: 100,
};

describe('pctHundredths', () => {
  test('reads whole and fractional percentages without floats', () => {
    expect(pctHundredths('10')).toBe(1000);
    expect(pctHundredths('10.00')).toBe(1000);
    expect(pctHundredths('12.5')).toBe(1250);
    expect(pctHundredths('0.05')).toBe(5);
  });
});

describe('tiers', () => {
  test('the tightest threshold that still applies wins, so the biggest discount', () => {
    expect(ruleFor(base.rules, 3)?.discountPct).toBe('10');
    expect(ruleFor(base.rules, 2)?.discountPct).toBe('25');
    expect(ruleFor(base.rules, 1)?.discountPct).toBe('40');
    expect(ruleFor(base.rules, 0)?.discountPct).toBe('40');
  });

  test('a rule applies at its threshold and not one day after', () => {
    expect(surplusFor({ ...base, daysLeft: 3 })?.discountPct).toBe(10);
    expect(surplusFor({ ...base, daysLeft: 4 })).toBeNull();
  });

  test('a product with no rules has no Surplus', () => {
    expect(surplusFor({ ...base, rules: [] })).toBeNull();
  });

  test('a rule set with a gap uses the next threshold up', () => {
    const rules = [{ daysRemaining: 5, discountPct: '5' }];
    expect(surplusFor({ ...base, rules, daysLeft: 4 })?.discountPct).toBe(5);
  });
});

describe('price', () => {
  test('matches the mock formula: 14000 at 10% is 12600, 14000 at 25% is 10500', () => {
    expect(surplusFor({ ...base, daysLeft: 3 })?.price).toBe(12600);
    expect(surplusFor({ ...base, daysLeft: 2 })?.price).toBe(10500);
  });

  test('rounds half up to the nearest Rp 100', () => {
    // 150 at 50% is 75, which is 0.75 of a hundred and rounds up to 100. 99 at 50% is 49.5, under half, so 0.
    const rules = [{ daysRemaining: 1, discountPct: '50' }];
    expect(surplusFor({ ...base, basePrice: 150, rules, daysLeft: 1 })?.price).toBe(100);
    expect(surplusFor({ ...base, basePrice: 149, rules, daysLeft: 1 })?.price).toBe(100);
    expect(surplusFor({ ...base, basePrice: 99, rules, daysLeft: 1 })?.price).toBe(0);
  });

  test('never goes below the farmer floor price', () => {
    const r = surplusFor({ ...base, floorPrice: 12000, daysLeft: 1 });
    expect(r?.price).toBe(12000);
  });

  test('the floor does not raise a price that is already above it', () => {
    expect(surplusFor({ ...base, floorPrice: 5000, daysLeft: 3 })?.price).toBe(12600);
  });

  test('accepts bigint and string rupiah without precision loss', () => {
    const r = surplusFor({ ...base, basePrice: 123456789012n, rules: [{ daysRemaining: 1, discountPct: '0' }], daysLeft: 1 });
    expect(r?.price).toBe(123456789000);
  });
});

describe('days left and stock', () => {
  test('no Surplus when the batch has expired', () => {
    expect(surplusFor({ ...base, daysLeft: -1 })).toBeNull();
  });

  test('no Surplus when there is no batch', () => {
    expect(surplusFor({ ...base, daysLeft: null })).toBeNull();
  });

  test('no Surplus when sold out', () => {
    expect(surplusFor({ ...base, stock: 0 })).toBeNull();
  });

  test('no Surplus when the product has the flag off', () => {
    expect(surplusFor({ ...base, surplusEnabled: false })).toBeNull();
  });

  test('effectivePrice falls back to the base price', () => {
    expect(effectivePrice({ ...base, daysLeft: 9 })).toBe(14000);
    expect(effectivePrice({ ...base, daysLeft: 3 })).toBe(12600);
  });
});
