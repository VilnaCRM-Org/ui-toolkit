import type { SxProps, Theme } from '@mui/material';

/**
 * Shared contract support:
 * - supported: onChange, disabled, error, sx
 * - exceptions: value, size, variant
 */
export interface UiCheckboxProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string | React.ReactNode;
  disabled?: boolean | undefined;
  sx?: SxProps<Theme> | undefined;
  error?: boolean | undefined;
  checked?: boolean | undefined;
  /**
   * Marks the checkbox as required for assistive technology via the native
   * `required` attribute on the underlying input (announced as required by
   * screen readers). The *visual* required indicator (asterisk/colour) is
   * intentionally deferred to the accessibility-visuals follow-up PR.
   */
  required?: boolean | undefined;
  /**
   * Optional description — typically the reason a checkbox is invalid. When
   * present it is rendered in a `FormHelperText` and linked to the input via
   * `aria-describedby`, so screen readers announce *why* the control is in
   * error alongside the `error` (`aria-invalid`) flag. Colour styling of the
   * message is deferred to the accessibility-visuals follow-up PR.
   */
  helperText?: React.ReactNode | undefined;
}
