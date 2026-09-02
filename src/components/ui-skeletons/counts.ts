// One contract for every repeat count a composed skeleton exposes. `rows`,
// `columns`, `tabs` and `lines` are public numeric props that all end up as an
// `Array.from({ length })` call, where a fractional value silently truncates
// and a non-finite one throws, so they are normalized here before they are used
// and the keys they drive are built by the same shared helper.

/**
 * Normalizes a public count prop to a whole, non-negative repeat count: a
 * non-finite value (`NaN`, `Infinity`) falls back to the call site's design
 * default, a fractional one is floored, and a negative one collapses to zero.
 */
export function normalizeCount(value: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.floor(value));
}

/** The one 1-based key recipe every repeated skeleton shape is keyed by. */
export function skeletonKey(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`;
}

/** Stable 1-based keys for a repeated shape (`prefix-1`, `prefix-2`, ...). */
export function getSkeletonKeys(prefix: string, count: number): string[] {
  const length: number = normalizeCount(count, 0);

  return Array.from({ length }, (_unused, index) => skeletonKey(prefix, index));
}
