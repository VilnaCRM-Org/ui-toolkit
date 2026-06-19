import { SxProps, Theme } from '@mui/material';

/**
 * Shared contract support:
 * - supported: onChange, disabled, error, sx
 * - exceptions: value, size, variant
 */
export interface UiCheckboxProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string | React.ReactNode;
  disabled?: boolean;
  sx?: SxProps<Theme>;
  error?: boolean;
  checked?: boolean;
}
