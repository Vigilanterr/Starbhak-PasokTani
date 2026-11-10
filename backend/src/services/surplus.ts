/**
 * Surplus pricing, as a pure function. The farmer sets rules as "discount X% when at most N days remain".
 * A rule applies when days left <= N, and the tightest threshold that still applies wins, so the biggest
 * discount wins. Rules that never apply give no Surplus.
 *
 * Money is integer rupiah. The discount is held in hundredths of a percent, so 12.5% is 1250 and no float
 * arithmetic happens. The result is rounded half up to the nearest Rp 100, as the public catalog shows it,
 * then raised to the farmer's floor price.
 */

export interface SurplusRule {
  /** Applies when the batch has this many days or fewer left. */
  daysRemaining: number;
  /** Numeric text from the database, for example "10.00". */
  discountPct: string;
}

export interface SurplusInput {
  /** Base unit price in rupiah. */
  basePrice: string | bigint;
  /** Floor price in rupiah; null means no floor. */
  floorPrice: string | bigint | null;
  surplusEnabled: boolean;
  rules: SurplusRule[];
  /** Days left on the active batch, from Postgres in Jakarta time. Null when there is no batch. */
  daysLeft: number | null;
  /** Sellable stock. Zero means nothing to discount. */
  stock: number;
}

export interface SurplusResult {
  discountPct: number;
  price: number;
}

/** Hundredths of a percent from numeric text. "12.5" -> 1250, "10" -> 1000. */
export function pctHundredths(text: string): number {
  const [whole = '0', frac = ''] = text.trim().split('.');
  const hundredths = frac.padEnd(2, '0').slice(0, 2);
  const value = BigInt(whole) * 100n + BigInt(hundredths);
  return Number(value);
}

/** The applicable rule with the smallest threshold, or undefined when none applies. */
export function ruleFor(rules: SurplusRule[], daysLeft: number): SurplusRule | undefined {
  return rules
    .filter((r) => daysLeft <= r.daysRemaining)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)[0];
}

/** Surplus discount and price, or null when Surplus does not apply right now. */
export function surplusFor(input: SurplusInput): SurplusResult | null {
  if (!input.surplusEnabled || input.stock <= 0) return null;
  if (input.daysLeft === null || input.daysLeft < 0) return null;
  const rule = ruleFor(input.rules, input.daysLeft);
  if (!rule) return null;

  const base = BigInt(input.basePrice);
  const d = BigInt(pctHundredths(rule.discountPct));
  // price * (1 - d/10000), rounded half up to the nearest Rp 100:
  // value / 100 rounded to an integer, times 100, is ((price * (10000 - d)) + 500000) / 1000000 * 100.
  const hundreds = (base * (10000n - d) + 500000n) / 1000000n;
  let price = hundreds * 100n;
  if (input.floorPrice !== null && input.floorPrice !== undefined) {
    const floor = BigInt(input.floorPrice);
    if (price < floor) price = floor;
  }
  return { discountPct: Number(rule.discountPct), price: Number(price) };
}

/** Price the buyer pays per unit now: the Surplus price when it applies, otherwise the base price. */
export function effectivePrice(input: SurplusInput): number {
  return surplusFor(input)?.price ?? Number(input.basePrice);
}
