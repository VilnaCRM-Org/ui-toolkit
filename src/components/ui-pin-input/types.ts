import type { SxProps, Theme } from '@mui/material';
import type React from 'react';

/**
 * Builds one cell's accessible name. 1-BASED `index` (the first cell is `1`), so
 * the default reads «Цифра 1 з 6» — the same ordinal a sighted user counts.
 */
export type UiPinCellLabel = (index: number, length: number) => string;

/**
 * One-time-code / PIN field: N discrete digit cells (Figma "2FA item",
 * component-set master `72:5172`, state nodes `439:19615` rest / `439:19617`
 * hover / `439:19619` active / `439:19623` disabled). The 64x86 master IS a
 * single cell — the design ships no group, no gap and no separator — so the cell
 * count, the 12px inter-cell gap and the entered-digit ink are rulings recorded
 * in the 3.5 implementation artifact, not Figma facts.
 *
 * **Structure (binding).** N separate native
 * `<input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1}>` cells
 * inside a `role="group"`. Never `type="number"` (spinners, scroll-wheel
 * mutation, and a locale-dependent value). One grouped input is rejected: the
 * design paints discrete cells, and per-cell inputs are what give a correct
 * caret, per-digit announcement and native forms-mode behaviour.
 * `autoComplete="one-time-code"` sits on the FIRST cell only, so the OS OTP
 * autofill has exactly one target; the shared paste path distributes the rest.
 *
 * **Group name.** The `role="group"` wrapper is named by `label` (`aria-label`)
 * or by `labelledBy` (`aria-labelledby`) when the consumer renders a visible
 * label — the `UiRadioGroup` precedent, and `labelledBy` wins when both are
 * passed. A group with neither dev-warns. Cells carry no visible text, so their
 * `aria-label` (from {@link UiPinCellLabel}) is legal (S7).
 *
 * **Always-controlled.** `value` is coerced (`?? ''`), filtered to digits and
 * clamped to `length`, so a nullish or dirty start can never flip a cell
 * uncontrolled (the `UiRadioGroup` footgun). The component holds NO React state:
 * its only internal state is the DOM focus target, kept in refs. There is
 * deliberately **no `onComplete`** — a second callback firing on the same
 * keystroke as `onChange` races it, and the consumer already knows the answer
 * from `next.length === length`.
 *
 * The value stays DENSE by construction: a digit typed into a cell past the end
 * of the current value lands at the end instead of opening a hole, so every
 * emitted string is digits-only and round-trips through the same normaliser it
 * came from.
 *
 * **Keyboard (exhaustive, binding).**
 *
 * | Key             | Effect                                                    |
 * | --------------- | --------------------------------------------------------- |
 * | digit           | fills the cell, focus advances (never past the last cell) |
 * | non-digit       | rejected — no value change, no advance                    |
 * | `Backspace`     | filled cell: clears it, focus stays                       |
 * | `Backspace`     | empty cell: focus moves back one cell and clears it       |
 * | `Delete`        | clears the current cell, focus stays                      |
 * | `ArrowLeft/Right` | moves focus one cell (clamped at both ends)             |
 * | paste           | strips non-digits, distributes from the focused cell,     |
 * |                 | truncates at `length`, focuses the cell after the last    |
 *
 * Cells select their content on focus, so typing overwrites. Every cell stays in
 * the natural tab order: there is **no roving tabindex**, because real inputs
 * must remain reachable in screen-reader forms mode — the arrow keys are a
 * convenience layer, never the only path. Autofill, paste and typed entry all
 * run through ONE write path, so a value can never be admitted by one route that
 * another would reject (the 2.4A file-upload lesson).
 *
 * **Error semantics.** `error` puts `aria-invalid="true"` on EVERY cell and
 * `helperText` renders once below the group, linked from every cell through
 * `aria-describedby` — per-cell announcement is intentional, since a user who
 * lands on cell 4 must still hear why the field is wrong. `error` without
 * `helperText` dev-warns: the error must never be colour-only, and the helper
 * text is the non-colour signal.
 *
 * **Disabled (mechanism deviation, artifact Ruling 3).** The repo boundary
 * pattern — focusable, handlers no-op, native `disabled` never set — is a
 * *button* mechanism; a text input needs `readOnly` to become non-editable while
 * staying focusable. So a disabled field is `readOnly` + `aria-disabled="true"`
 * on every cell: `onChange` never fires, the caret and the hover recipe are
 * suppressed, and keyboard focus is never dropped when a focused field flips
 * disabled (SC 2.4.3). Native `disabled` remains forbidden. The `role="group"`
 * wrapper carries no `aria-disabled` of its own — it is not a widget role.
 *
 * **Focus.** Amendment A1 per cell: the two-selector `:focus-visible` ring ships
 * IN ADDITION to Figma's active caret + shadow, because Figma specifies no focus
 * ring and a text caret alone is not a 3:1 indicator. State chrome and focus
 * chrome are orthogonal channels; neither substitutes for the other.
 *
 * Shared prop-contract mapping:
 *
 * | Field      | UiPinInput        | Rationale                                  |
 * | ---------- | ----------------- | ------------------------------------------ |
 * | `value`    | supported         | Full concatenated digit string             |
 * | `onChange` | `(next: string)`  | Presence is what makes the cells editable  |
 * | `disabled` | supported         | `readOnly` + `aria-disabled` (Ruling 3)    |
 * | `error`    | supported         | `aria-invalid` on every cell + helper text |
 * | `required` | supported         | `aria-required` on the FIRST cell only     |
 * | `size`     | N/A               | One 64x86 master; no size axis exists      |
 * | `variant`  | N/A               | Rest/hover/active/disabled are states      |
 * | `sx`       | supported         | Merged last on the root, `[base, ...sx]`   |
 *
 * There is no animation, no transition and no live region in any state: a PIN
 * field announces through its cells, and narrating consumer-owned state changes
 * is the consumer's concern.
 */
export interface UiPinInputProps {
  /**
   * The group's accessible name, applied as `aria-label`. Required in practice —
   * a field with neither `label` nor `labelledBy` dev-warns.
   */
  label?: string;
  /**
   * Id of a visible element that names the group (`aria-labelledby`). Preferred
   * over `label` when the consumer paints its own heading, and it wins when both
   * are supplied.
   */
  labelledBy?: string;
  /**
   * The entered digits, concatenated. ALWAYS controlled: nullish becomes `''`,
   * non-digits are filtered out and anything past `length` is clamped away (both
   * dev-warn). Cell `i` paints `value.charAt(i)`.
   */
  value?: string;
  /**
   * Receives the full next value on every accepted edit. Its PRESENCE is what
   * makes the cells editable — without it the field renders the same tree as
   * read-only content, exactly like the wired/static split on the Epic 3 cards.
   * There is no `onComplete`; compare `next.length === length` instead.
   */
  onChange?: (next: string) => void;
  /** Cell count. Default 6, normalised to a whole number of at least 1 (warns). */
  length?: number;
  /** Per-cell accessible name; default «Цифра ${index} з ${length}», 1-based. */
  cellLabel?: UiPinCellLabel;
  /**
   * Marks the field required. `aria-required="true"` lands on the FIRST cell
   * only — one announcement for one field, rather than N repeats — and the
   * native `required` attribute is never used, since a per-cell native
   * constraint would block submission on a partially typed code.
   */
  required?: boolean;
  /**
   * Invalid status: `aria-invalid="true"` on every cell. Pair it with
   * `helperText`, always — the error is never colour-only.
   */
  error?: boolean;
  /**
   * Rendered once below the group and linked from every cell through
   * `aria-describedby`. The non-colour channel for `error`.
   */
  helperText?: React.ReactNode;
  /**
   * Disabled status, expressed as `readOnly` + `aria-disabled` on every cell
   * (Ruling 3). Cells stay focusable and native `disabled` is never set.
   */
  disabled?: boolean;
  /** `id` for the `role="group"` element; also seeds the helper-text id. */
  id?: string;
  sx?: SxProps<Theme>;
}
