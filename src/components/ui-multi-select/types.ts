import type { SxProps, Theme } from '@mui/material';
import type React from 'react';

/** A single selectable option. CRM data needs a label/value split. */
export interface UiMultiSelectOption {
  label: string;
  value: string;
}

/**
 * Shared contract support:
 * - supported: value, onChange, disabled, error, size, variant, sx
 *
 * Multi-value searchable combobox built on MUI `Autocomplete` (`multiple`): the
 * selected options render as removable chips inside the field. The raw MUI
 * `(event, value, reason)` change signature is adapted to the shared contract so
 * consumers depend on `value`/`onChange` (an `Option[]`), not MUI internals.
 * Field-level accessibility (accessible name, `aria-invalid` on `error`,
 * `aria-describedby` on `helperText`, native `required`) is owned by this
 * control; form-level concerns (submit focus management, `role="alert"` error
 * summaries) belong to the consuming form, not this primitive.
 */
export interface UiMultiSelectProps {
  /** Selectable options. */
  options: UiMultiSelectOption[];
  /** Controlled selected options (empty array when nothing is selected). */
  value?: UiMultiSelectOption[];
  /** Called with the full next selection whenever an option is added or removed. */
  onChange?: (value: UiMultiSelectOption[]) => void;
  /**
   * Marks the options as being fetched. The toolkit is presentational — it never
   * fetches; the consuming app owns the request and drives this flag.
   *
   * Unlike UiSelectWithSearch, the clear-all × is KEPT while loading and the
   * spinner is drawn as a ring around it — its × is Figma-mandated
   * always-visible (node 622:44553), so hiding it would drop a design-mandated
   * control. `undefined` (the default) opts out entirely and leaves the DOM
   * unchanged.
   */
  loading?: boolean;
  /**
   * Loading copy: the popup row while options are in flight, and the text the
   * field's polite `role="status"` region speaks once a fetch has run long
   * enough to be worth announcing. Defaults to `'Завантаження'`.
   */
  loadingText?: string;
  disabled?: boolean;
  error?: boolean;
  /**
   * Marks the control required for assistive technology via the native
   * `required` attribute while the selection is empty (a required multi-value
   * field is satisfied once at least one chip exists). The MUI `TextField`
   * renders the native required asterisk; no extra visual treatment is added.
   */
  required?: boolean;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
  sx?: SxProps<Theme>;
  /** Visible label — the preferred accessible name (WCAG 2.4.6 / 3.3.2). */
  label?: string;
  /** Accessible name used only when there is no visible `label`. */
  'aria-label'?: string;
  placeholder?: string;
  /**
   * Description — typically the reason the field is invalid. Rendered in a
   * `FormHelperText` and linked to the input via `aria-describedby`, so screen
   * readers announce *why* the control is in error alongside `aria-invalid`.
   */
  helperText?: React.ReactNode;
  /** Associates an external `<label htmlFor>`; also seeds the combobox/listbox ids. */
  id?: string;
  /** Forces the dropdown open. For demos/visual states only; omit in app use. */
  open?: boolean;
  /** Renders the dropdown inline instead of in a portal. Pairs with `open` for demos. */
  disablePortal?: boolean;
}
