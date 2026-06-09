import { TextField, ThemeProvider } from '@mui/material';
import React from 'react';

import theme from './theme';
import { UiInputProps } from './types';

const DISPLAY_NAME: string = 'UiInput';

const UiInput: React.ForwardRefExoticComponent<
  UiInputProps & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, UiInputProps>(
  (
    {
      sx,
      placeholder,
      error,
      size,
      variant,
      onBlur,
      type,
      fullWidth,
      value,
      onChange,
      disabled,
      onInput,
      id,
    },
    ref
  ) => (
    <ThemeProvider theme={theme}>
      <TextField
        sx={sx}
        placeholder={placeholder}
        inputRef={ref}
        slotProps={{
          htmlInput: {
            onInput: onInput
              ? (event: React.FormEvent<HTMLInputElement>): void =>
                  onInput(event as unknown as React.ChangeEvent<HTMLInputElement>)
              : undefined,
          },
        }}
        error={error}
        size={size}
        variant={variant}
        type={type}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        fullWidth={fullWidth}
        disabled={disabled}
        id={id}
      />
    </ThemeProvider>
  )
);

UiInput.displayName = DISPLAY_NAME;

export default UiInput;
