/**
 * Rounds a number to the specified number of decimal places.
 * @param value - The number to round.
 * @param decimals - The number of decimal places (default is 2).
 * @returns The rounded number.
 */
export function round(value: number, decimals = 2): number {
  return Number(Math.round((value + 'e' + decimals) as never) + 'e-' + decimals);
}

/**
 * Checks if a number is within a specified range (inclusive).
 * @param x - The number to check.
 * @param min - The minimum value of the range.
 * @param max - The maximum value of the range.
 * @returns `true` if `x` is within the range `[min, max]`, `false` otherwise.
 */
export function inRange(x: number, min: number, max: number): boolean {
  return x >= min && x <= max;
}
