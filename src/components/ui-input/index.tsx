import { TextField, ThemeProvider } from '@mui/material';
import React from 'react';

import theme from './theme';
import type { UiInputProps } from './types';

type InputSlotProp = NonNullable<NonNullable<UiInputProps['slotProps']>['input']>;
type InputSlotFn = Extract<InputSlotProp, (...args: never[]) => unknown>;
type InputSlotOwnerState = Parameters<InputSlotFn>[0];
type InputSlotValue = ReturnType<InputSlotFn>;

const DISPLAY_NAME: string = 'UiInput';

const MISSING_NAME_WARNING: string =
  'UiInput has no accessible name: pass `label`, `aria-label` (via slotProps.input), or `id`.';
const ERROR_WITHOUT_HELPER_WARNING: string =
  'UiInput has `error` set but no `helperText`; assistive tech gets no reason for the error.';

// An accessible name for an MUI text field can only come from the `label` prop,
// an `aria-label`/`aria-labelledby` carried on the input slot (`slotProps.input`
// or `InputProps`), or an external `<label>` associated via `id`. A `placeholder`
// is not a name. We can't inspect a function slot, so its presence is treated as
// "the consumer named it" to avoid false positives.
function hasAccessibleName(props: UiInputProps): boolean {
  return (
    props.label != null ||
    props.id != null ||
    props.slotProps?.input != null ||
    props.InputProps != null
  );
}

// Development-only accessibility guidance; stripped in production to keep the
// published bundle quiet. Backward compatible — nothing is enforced at runtime.
function emitInputAccessibilityWarnings(
  nameWarning: string | null,
  errorWarning: string | null
): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  if (nameWarning) {
    console.warn(nameWarning);
  }
  if (errorWarning) {
    console.warn(errorWarning);
  }
}

// Emitted from an effect keyed to the derived warning state (not raw props) so a
// normal re-render does not re-log, but a prop change into/out of a warning state
// does.
function useInputAccessibilityWarnings(props: UiInputProps): void {
  const nameWarning: string | null = hasAccessibleName(props) ? null : MISSING_NAME_WARNING;
  const errorWarning: string | null =
    props.error && props.helperText == null ? ERROR_WITHOUT_HELPER_WARNING : null;

  React.useEffect((): void => {
    emitInputAccessibilityWarnings(nameWarning, errorWarning);
  }, [nameWarning, errorWarning]);
}

const UiInput: React.ForwardRefExoticComponent<
  UiInputProps & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, UiInputProps>((props, ref) => {
  const { InputProps, slotProps, ...rest } = props;
  useInputAccessibilityWarnings(props);

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
