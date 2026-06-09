import { TextField, ThemeProvider } from '@mui/material';
import React from 'react';

import theme from './theme';
import { UiInputProps } from './types';

const DISPLAY_NAME: string = 'UiInput';

const UiInput: React.ForwardRefExoticComponent<
  UiInputProps & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, UiInputProps>(
  ({ InputProps, onInput, slotProps, ...rest }, ref) => {
    const mergedSlotProps: UiInputProps['slotProps'] = InputProps
      ? {
          ...slotProps,
          input: ownerState => {
            const base =
              typeof slotProps?.input === 'function'
                ? slotProps.input(ownerState)
                : slotProps?.input;
            return { ...base, ...InputProps };
          },
        }
      : slotProps;

    return (
      <ThemeProvider theme={theme}>
        <TextField
          {...rest}
          inputRef={ref}
          slotProps={mergedSlotProps}
          onInput={
            onInput
              ? (event: React.FormEvent<HTMLDivElement>): void =>
                  onInput(event as unknown as React.ChangeEvent<HTMLInputElement>)
              : undefined
          }
        />
      </ThemeProvider>
    );
  }
);

UiInput.displayName = DISPLAY_NAME;

export default UiInput;
