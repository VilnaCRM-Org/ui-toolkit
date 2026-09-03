import type { SxProps, Theme } from '@mui/material';

/** One segment: a radio-style option identified by `value`, with its visible `label`. */
export interface SegmentedOption {
  value: string;
  label: string;
  /** Disables this option only (the whole group can be disabled via `disabled`). */
  disabled?: boolean;
}

/**
 * A period-switcher control (Figma Board B `439:19374`): a grey track holding N
 * text-only segments, one of which is the selected white pill. Only rest and
 * hover are painted — no active, no disabled and no focus master exist, so
 * those three are semantics-only additions (see `styles.ts`).
 *
 * **ARIA radio group** (a11y contract, the `UiIntegrationCard` precedent): the
 * wired root is `<div role="radiogroup">`, each segment a native
 * `<button type="button" role="radio">` carrying a permanent `aria-checked`.
 * Every segment is an ordinary tab stop (`tabIndex={0}`) — no roving tabindex
 * and no arrow-key handler, unlike `UiRadioGroup`'s native `RadioGroup`.
 *
 * The control follows the repo wired/static split, switched on `onChange`:
 * - Wired → the `role="radiogroup"` / `role="radio"` tree above.
 * - Unwired → a static `<div>` of `<span>`s with no roles at all, painting the
 *   rest presentation regardless of `value` (dev-warned) — the static branch
 *   never renders state it cannot expose programmatically.
 *
 * The accessible name of each segment is its visible `label`; the group's name
 * comes from `labelledBy` (wins) or `label`, exactly like `UiRadioGroup`.
 */
export interface UiSegmentedControlProps {
  /** Segments rendered left to right, in order. */
  options: readonly SegmentedOption[];
  /**
   * Controlled selected `value`. Always controlled: `''` (or omitting the
   * prop) means "nothing selected" (the `UiRadioGroup` `value ?? ''` recipe).
   */
  value?: string;
  /** Called with the newly selected segment's `value`. Presence wires the control. */
  onChange?: (value: string) => void;
  /** Visible-less accessible name for the group; loses to `labelledBy`. */
  label?: string;
  /** `aria-labelledby` for the group; wins over `label` when both are given. */
  labelledBy?: string;
  /** Disables every segment (a single segment can also disable via `SegmentedOption.disabled`). */
  disabled?: boolean;
  /** `id` for the root. */
  id?: string;
  /** Only when the segment text's language differs from the page's (SC 3.1.2). */
  lang?: string;
  sx?: SxProps<Theme>;
}
