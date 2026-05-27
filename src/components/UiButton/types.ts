import { SxProps, Theme } from '@mui/material';
import React from 'react';

/**
 * Shared form-control contract (cross-file convention used by UiInput etc.):
 * - supported here: disabled, size, variant, sx
 * - not supported here: value, onChange, error (form-input-only props)
 */
export interface UiButtonProps {
  variant?: 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  name?: string;
}
