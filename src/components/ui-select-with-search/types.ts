import type { SxProps, Theme } from '@mui/material';
import type React from 'react';

/** A single selectable option. CRM data needs a label/value split. */
export interface UiSelectWithSearchOption {
  label: string;
  value: string;
}

/**
 * Shared contract support:
 * - supported: value, onChange, disabled, error, size, variant, sx
 *
 * Single-select, searchable combobox built on MUI `Autocomplete`. The raw MUI
 * `(event, value, reason)` change signature is adapted to the shared contract so
 * consumers depend on `value`/`onChange`, not MUI internals. Field-level
 * accessibility (accessible name, `aria-invalid` on `error`, `aria-describedby`
 * on `helperText`, native `required`) is owned by this control; form-level
 * concerns (submit focus management, `role="alert"` error summaries) belong to
 * the consuming form, not this primitive.
 */
export interface UiSelectWithSearchProps {
  /** Selectable options. */
  options: UiSelectWithSearchOption[];
  /** Controlled selected option (`null` when nothing is selected). */
  value?: UiSelectWithSearchOption | null | undefined;
  /** Called with the newly selected option, or `null` when the value is cleared. */
  onChange?: ((value: UiSelectWithSearchOption | null) => void) | undefined;
  disabled?: boolean | undefined;
  error?: boolean | undefined;
  /**
   * Marks the control as required for assistive technology via the native
   * `required` attribute (announced as required by screen readers). The MUI
   * `TextField` renders the native required asterisk; no extra visual treatment
   * is added by this story.
   */
  required?: boolean | undefined;
  size?: 'small' | 'medium' | undefined;
  variant?: 'outlined' | 'filled' | 'standard' | undefined;
  sx?: SxProps<Theme> | undefined;
  /** Visible label — the preferred accessible name (WCAG 2.4.6 / 3.3.2). */
  label?: string | undefined;
  /** Accessible name used only when there is no visible `label`. */
  'aria-label'?: string | undefined;
  placeholder?: string | undefined;
  /**
   * Description — typically the reason the field is invalid. Rendered in a
   * `FormHelperText` and linked to the input via `aria-describedby`, so screen
   * readers announce *why* the control is in error alongside `aria-invalid`.
   */
  helperText?: React.ReactNode | undefined;
  /** Associates an external `<label htmlFor>`; also seeds the combobox/listbox ids. */
  id?: string | undefined;
  /**
   * Forces the dropdown open. For demos/visual states only; OMIT in app use —
   * do not pass `false` (it is a forced mask, not an "initially closed" hint,
   * and would permanently wedge keyboard opening).
   */
  open?: boolean | undefined;
  /** Renders the dropdown inline instead of in a portal. Pairs with `open` for demos. */
  disablePortal?: boolean | undefined;
}
