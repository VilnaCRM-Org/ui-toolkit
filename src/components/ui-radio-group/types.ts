import type { SxProps, Theme } from '@mui/material';
import type React from 'react';

/** A single selectable radio option. CRM data needs a label/value split. */
export interface UiRadioOption {
  label: string;
  value: string;
  /** Disables this option only (the whole group can be disabled via `disabled`). */
  disabled?: boolean;
}

/**
 * Shared contract support:
 * - supported: value, onChange, disabled, error, sx
 * - exceptions: size, variant — the Figma radio is a single fixed 20px glyph
 *   with no size/variant axis, matching `UiCheckbox`.
 *
 * Single-choice radio group built on MUI `RadioGroup`. The raw MUI
 * `(event, value)` change signature is adapted to the shared contract so
 * consumers depend on `value`/`onChange` (the selected option's `value` string),
 * not MUI internals. Group-level accessibility (accessible name from `label`
 * else `aria-label`, `aria-invalid` on `error`, `aria-describedby` on
 * `helperText`, native `required`, and MUI's roving-focus arrow-key selection)
 * is owned by this control; form-level concerns (submit focus management,
 * `role="alert"` error summaries) belong to the consuming form, not this
 * primitive.
 */
export interface UiRadioGroupProps {
  /** Selectable options rendered as radios, in order. */
  options: UiRadioOption[];
  /** Controlled selected value (omit / `undefined` leaves the group uncontrolled). */
  value?: string;
  /** Called with the newly selected option's `value` whenever the choice changes. */
  onChange?: (value: string) => void;
  /**
   * Shared `name` grouping the radios for form submission; MUI generates one
   * when omitted, so keyboard grouping works either way.
   */
  name?: string;
  /**
   * Disables the whole group (single options can also be disabled via
   * `UiRadioOption.disabled`).
   */
  disabled?: boolean;
  error?: boolean;
  /**
   * Marks the group required for assistive technology and native validation via
   * the `required` attribute on the radios (an unselected required group reports
   * `:invalid`; selecting any option satisfies it). MUI renders the native
   * required asterisk on the group label; no extra visual treatment is added.
   */
  required?: boolean;
  /** Lays the options out in a row instead of the default column. */
  row?: boolean;
  sx?: SxProps<Theme>;
  /** Visible group label — the preferred accessible name (WCAG 2.4.6 / 3.3.2). */
  label?: string;
  /** Accessible name used only when there is no visible `label`. */
  'aria-label'?: string;
  /**
   * Description — typically the reason the group is invalid. Rendered in a
   * `FormHelperText` and linked to the group via `aria-describedby`, so screen
   * readers announce *why* the group is in error alongside `aria-invalid`.
   */
  helperText?: React.ReactNode;
  /** Seeds the group label / helper-text ids (and can associate an external label). */
  id?: string;
}
