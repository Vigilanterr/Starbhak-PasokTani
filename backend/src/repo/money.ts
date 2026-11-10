/**
 * bigint (rupiah) and numeric (quantities) come back from pg as strings.
 * These helpers convert at the edges so no global type parser can lose precision.
 */

export function toBigInt(value: string | number | bigint): bigint {
  return typeof value === 'bigint' ? value : BigInt(value);
}

/** Rupiah amounts above Number.MAX_SAFE_INTEGER are rejected rather than rounded. */
export function rupiahToNumber(value: string | bigint): number {
  const n = Number(value);
  if (!Number.isSafeInteger(n)) throw new RangeError(`Rupiah amount out of safe range: ${value}`);
  return n;
}

export function numericToNumber(value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new RangeError(`Not a finite number: ${value}`);
  return n;
}

/** Formats a quantity for a numeric column without exponent notation. */
export function qty(value: number | string): string {
  if (typeof value === 'string') return value;
  if (!Number.isFinite(value)) throw new RangeError(`Not a finite number: ${value}`);
  return value.toString().includes('e') ? value.toFixed(3) : value.toString();
}
