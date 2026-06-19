import { TextField, ThemeProvider } from '@mui/material';
import React from 'react';

import theme from './theme';
import { UiInputProps } from './types';

type InputSlotProp = NonNullable<NonNullable<UiInputProps['slotProps']>['input']>;
type InputSlotFn = Extract<InputSlotProp, (...args: never[]) => unknown>;
type InputSlotOwnerState = Parameters<InputSlotFn>[0];
type InputSlotValue = ReturnType<InputSlotFn>;

const DISPLAY_NAME: string = 'UiInput';

const UiInput: React.ForwardRefExoticComponent<
  UiInputProps & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, UiInputProps>(({ InputProps, slotProps, ...rest }, ref) => {
  const mergedSlotProps: UiInputProps['slotProps'] = InputProps
    ? {
        ...slotProps,
        input: (ownerState: InputSlotOwnerState): InputSlotValue => {
          const base: InputSlotValue | undefined =
            typeof slotProps?.input === 'function' ? slotProps.input(ownerState) : slotProps?.input;
          return { ...base, ...InputProps };
        },
      }
    : slotProps;

  return (
    <ThemeProvider theme={theme}>
      <TextField {...rest} inputRef={ref} slotProps={mergedSlotProps} />
    </ThemeProvider>
  );
});

UiInput.displayName = DISPLAY_NAME;

export default UiInput;
