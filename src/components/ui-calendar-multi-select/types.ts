import type { SxProps, Theme } from '@mui/material';
import type React from 'react';

/**
 * Shared contract support:
 * - supported: value, onChange, disabled, error, size, sx
 * - documented exception: `variant` is N/A — a calendar surface has no
 *   outlined/filled/standard rendering, so the prop is intentionally omitted.
 *
 * A calendar-style control for selecting a DATE RANGE by its two endpoints. The
 * value is the range's endpoints as ISO `YYYY-MM-DD` strings — `[]` (empty),
 * `[start]` (a pending range awaiting its end) or `[start, end]` (complete,
 * sorted); the days strictly between the endpoints are the in-range band and are
 * derived, never stored. ISO strings keep the value timezone-safe, serialisable
 * and easy to compare. The displayed month is uncontrolled — seeded from
 * `defaultMonth`, then the range's start, then today — so the consumer never has
 * to own calendar-navigation state.
 *
 * Field-level accessibility (accessible name, `aria-invalid` on `error`,
 * `aria-describedby` on `helperText`, native `required`) is owned by this
 * control; form-level concerns (submit focus management, `role="alert"` error
 * summaries) belong to the consuming form, not this primitive.
 */
export interface UiCalendarMultiSelectProps {
  /** Controlled range endpoints as ISO `YYYY-MM-DD` strings: `[]`, `[start]` or `[start, end]`. */
  value?: string[];
  /** Called with the next range endpoints whenever a day sets the start or the end. */
  onChange?: (value: string[]) => void;
  /**
   * Month shown when the calendar first renders, as `YYYY-MM-DD` (any day in the
   * target month) — uncontrolled. Defaults to the first selected date's month,
   * or the current month when there is no selection.
   */
  defaultMonth?: string;
  /** Earliest selectable day (inclusive), `YYYY-MM-DD`. Earlier days are disabled. */
  minDate?: string;
  /** Latest selectable day (inclusive), `YYYY-MM-DD`. Later days are disabled. */
  maxDate?: string;
  /** Disables the whole calendar (navigation and every day). */
  disabled?: boolean;
  /**
   * Puts the control in the error state: an error border, and — when `helperText`
   * is given — a `role="alert"` announcement plus `aria-describedby` wiring.
   * Suppressed while `disabled`. (`aria-invalid` is intentionally not used: ARIA
   * does not support it on `role="grid"`.)
   */
  error?: boolean;
  /**
   * Marks the control required for assistive technology. A visible asterisk (for
   * sighted users) plus a visually-hidden " required" folded into the group's
   * accessible name convey it; `role="group"` cannot host `aria-required`.
   * Native `<form>` validation is a consumer concern (the control is controlled
   * via `value`/`onChange`).
   */
  required?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
  /** Visible label — the preferred accessible name (WCAG 2.4.6 / 3.3.2). */
  label?: string;
  /** Accessible name used only when there is no visible `label`. */
  'aria-label'?: string;
  /**
   * Description — typically the reason the selection is invalid. Rendered in a
   * `FormHelperText` and linked to the grid via `aria-describedby`, so screen
   * readers announce *why* the control is in error alongside `aria-invalid`.
   */
  helperText?: React.ReactNode;
  /**
   * Seeds the internal element ids (label/caption/helper). It does NOT name the
   * group — a native `<label for>` cannot target a `role="group"`; pass `label`
   * or `aria-label` for the accessible name.
   */
  id?: string;
  /**
   * BCP-47 locale for the month caption, weekday headers and day accessible
   * names (e.g. `uk-UA`). Defaults to `en-US`. The week always starts on Monday.
   */
  locale?: string;
}
