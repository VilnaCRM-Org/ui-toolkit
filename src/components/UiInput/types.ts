import { SxProps, TextFieldProps, Theme } from '@mui/material';

/**
 * Shared contract support:
 * - supported: value, onChange, disabled, error, size, variant, sx
 * - exceptions: none for Story 1.1 baseline
 */
export interface UiInputProps {
  sx?: SxProps<Theme>;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ref?: React.ForwardedRef<HTMLInputElement>;
  error?: boolean;
  size?: TextFieldProps['size'];
  variant?: TextFieldProps['variant'];
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  type?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  onInput?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
}
