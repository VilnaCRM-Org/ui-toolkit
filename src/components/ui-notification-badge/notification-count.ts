// The counter arithmetic for UiNotificationBadge, kept apart from the view model
// so the whole normalisation contract is one small pure module: ONE display string
// feeds both the visible chip and the accessible name, which is what makes a
// mismatch between them unrepresentable (a11y contract §6, WCAG 2.5.3).

/** The Figma cap: above nine the chip reads `9+`. */
export const DEFAULT_MAX: number = 9;

/** The lowest cap that can still produce a meaningful `${max}+` string. */
const MIN_MAX: number = 1;

export interface NotificationCountInput {
  count: number;
  max: number | undefined;
}

export interface NotificationCount {
  /** Normalised, non-negative integer count. `0` renders no chip at all. */
  count: number;
  /** Normalised, positive integer cap. */
  max: number;
  /** What the chip shows AND what the accessible name must contain. */
  display: string;
}

// Runtime backstop for the values the strict prop types forbid but API payloads
// produce anyway (`NaN` from a failed parse, `-1` from a sentinel, `2.5` from an
// average). Normalising instead of throwing keeps the badge renderable; the
// dev-warning module reports the same condition separately.
function normalizeCount(count: number): number {
  if (!Number.isFinite(count) || count < 0) {
    return 0;
  }
  return Math.floor(count);
}

// `max` is optional, so a nullish value is the DEFAULT rather than an error; only
// a supplied out-of-range cap is clamped (and warned about elsewhere).
function normalizeMax(max: number | undefined): number {
  const supplied: number = max ?? DEFAULT_MAX;
  if (!Number.isFinite(supplied) || supplied < MIN_MAX) {
    return MIN_MAX;
  }
  return Math.floor(supplied);
}

/** The normalised count, its cap, and the single display string both channels use. */
export function resolveCount(input: Readonly<NotificationCountInput>): NotificationCount {
  const count: number = normalizeCount(input.count);
  const max: number = normalizeMax(input.max);
  return { count, max, display: count > max ? `${max}+` : String(count) };
}
