import { FormLabel } from '@mui/material';
import React from 'react';

import colorTheme from '../ui-color-theme';

// External static field label. Figma places the label ABOVE the field (Inter
// Medium 14/18, #404142, with a 9px gap) rather than inside MUI's notched
// outline. Rendered as a real `<label htmlFor>` so it names the control for
// assistive tech; the required asterisk and the error colour reinforce those
// states visually without relying on colour alone (the input still carries
// `aria-invalid` / native `required`).
const fieldLabelSx = {
  display: 'block',
  marginBottom: '0.5625rem',
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  color: colorTheme.palette.grey200.main,
  // Keep the label ink stable on focus (Figma does not tint it blue).
  '&.Mui-focused': {
    color: colorTheme.palette.grey200.main,
  },
  '&.Mui-error': {
    color: colorTheme.palette.error.main,
  },
} as const;

export interface FieldLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean | undefined;
  error?: boolean | undefined;
}

export function FieldLabel({
  htmlFor,
  children,
  required,
  error,
}: FieldLabelProps): React.ReactElement {
  return (
    <FormLabel
      htmlFor={htmlFor}
      required={required === true}
      error={error === true}
      sx={fieldLabelSx}
    >
      {children}
    </FormLabel>
  );
}
