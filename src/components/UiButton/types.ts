import { SxProps, Theme } from '@mui/material';

/**
 * Shared contract support:
 * - supported: disabled, size, variant, sx
 * - exceptions: value, onChange, error
 */
export interface UiButtonProps {
  variant?: 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode | string;
  sx?: SxProps<Theme>;
  name?: string;
}
