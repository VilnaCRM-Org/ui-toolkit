import type { SxProps, Theme } from '@mui/material';
import type React from 'react';

/**
 * Shared contract support:
 * - supported: value, onChange, disabled, error, size, sx
 *
 * Search-with-suggestions built on MUI `Autocomplete` (`freeSolo`): a free-text
 * search field with a leading magnifier (grey at rest, brand-blue on focus) and
 * an optional typeahead suggestions dropdown. With no `options` it is a plain
 * search box; with `options` it surfaces selectable suggestions (Figma "Search").
 *
 * Field-level accessibility (accessible name, `aria-invalid` on `error`,
 * `aria-describedby` on `helperText`, native `required`) is owned by this
 * control; form-level concerns (submit focus management, `role="alert"` error
 * summaries) belong to the consuming form, not this primitive.
 */
export interface UiSearchInputProps {
  /** Controlled search text. */
  value?: string | undefined;
  /** Called with the search text on every change — typing or picking a suggestion. */
  onChange?: ((value: string) => void) | undefined;
  /** Optional typeahead suggestions. Omit for a plain search box. */
  options?: string[] | undefined;
  disabled?: boolean | undefined;
  error?: boolean | undefined;
  /**
   * Marks the field required for assistive technology via the native `required`
   * attribute. The MUI `TextField` renders the native required asterisk; no
   * extra visual treatment is added by this story.
   */
  required?: boolean | undefined;
  size?: 'small' | 'medium' | undefined;
  sx?: SxProps<Theme> | undefined;
  /** Visible label — the preferred accessible name (WCAG 2.4.6 / 3.3.2). */
  label?: string | undefined;
  /** Accessible name used only when there is no visible `label`. */
  'aria-label'?: string | undefined;
  placeholder?: string | undefined;
  /**
   * Description — typically the reason the field is invalid. Rendered in a
   * `FormHelperText` and linked to the input via `aria-describedby`.
   */
  helperText?: React.ReactNode | undefined;
  /** Associates an external `<label htmlFor>`; also seeds the combobox/listbox ids. */
  id?: string | undefined;
  /** Text shown in the suggestions popup when no option matches. */
  noOptionsText?: React.ReactNode | undefined;
  /** Forces the suggestions dropdown open. For demos/visual states; omit in app use. */
  open?: boolean | undefined;
  /** Renders the dropdown inline instead of in a portal. Pairs with `open` for demos. */
  disablePortal?: boolean | undefined;
}
