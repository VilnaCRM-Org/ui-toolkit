import { TextField } from '@mui/material';
import React from 'react';

import ScopedThemeProvider from '@/components/theme-scope';

import { hasText } from '../field-controls';

import { inputAria, type InputAriaAttrs } from './aria';
import theme from './theme';
import type { UiInputProps } from './types';

type HtmlInputSlotProp = NonNullable<NonNullable<UiInputProps['slotProps']>['htmlInput']>;
type HtmlInputSlotFn = Extract<HtmlInputSlotProp, (...args: never[]) => unknown>;
type HtmlInputOwnerState = Parameters<HtmlInputSlotFn>[0];
type HtmlInputSlotValue = ReturnType<HtmlInputSlotFn>;

type InputSlotProp = NonNullable<NonNullable<UiInputProps['slotProps']>['input']>;
type InputSlotFn = Extract<InputSlotProp, (...args: never[]) => unknown>;
type InputSlotOwnerState = Parameters<InputSlotFn>[0];
type InputSlotValue = ReturnType<InputSlotFn>;

/** The deprecated `InputProps.inputProps` — the same native input as `htmlInput`. */
type LegacyHtmlInput = NonNullable<NonNullable<UiInputProps['InputProps']>['inputProps']>;

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

// Layers `under` BENEATH whatever the consumer already put on the htmlInput
// slot, so nothing a caller wrote by hand is overwritten. Used twice: once for
// the ARIA this control derives, once for the deprecated `InputProps.inputProps`
// — which addresses the same native input and therefore has to arrive through
// the same slot rather than compete with it.
//
// MUI allows a slot to be `(ownerState) => props` as well as a plain object, and
// spreading a FUNCTION copies no own enumerable properties — so the object form
// alone silently dropped a caller's callback, and every attribute it returned,
// the moment this control had something to write. The callback is re-wrapped.
function mergeHtmlInput(
  slotProps: UiInputProps['slotProps'],
  under: InputAriaAttrs | LegacyHtmlInput
): UiInputProps['slotProps'] {
  const own: HtmlInputSlotProp | undefined = slotProps?.htmlInput;
  if (typeof own === 'function') {
    return {
      ...slotProps,
      htmlInput: (ownerState: HtmlInputOwnerState): HtmlInputSlotValue => ({
        ...under,
        ...own(ownerState),
      }),
    };
  }
  return { ...slotProps, htmlInput: { ...under, ...own } };
}

// The legacy `InputProps` minus its `inputProps`, folded onto the `input` slot.
// Kept as a callback so a function-valued consumer slot is still invoked with
// the owner state rather than spread away.
function withLegacyInputSlot(
  slotProps: UiInputProps['slotProps'],
  extra: object
): UiInputProps['slotProps'] {
  return {
    ...slotProps,
    input: (ownerState: InputSlotOwnerState): InputSlotValue => {
      const base: InputSlotValue | undefined =
        typeof slotProps?.input === 'function' ? slotProps.input(ownerState) : slotProps?.input;
      return { ...base, ...extra };
    },
  };
}

/** The two consumer-supplied slot sources, plus the ARIA this control derived. */
interface InputSlotSources {
  InputProps: UiInputProps['InputProps'];
  slotProps: UiInputProps['slotProps'];
  /** `null` when this control owns no ARIA, so the slot is left untouched. */
  aria: InputAriaAttrs | null;
}

// The whole native-input slot assembly, lifted out of the component body to
// keep that body inside the Halstead budget.
//
// `InputProps.inputProps` targets the SAME native input as `slotProps.htmlInput`
// — and MUI lets the slot's own `inputProps` win, so leaving it on the `input`
// slot silently dropped every attribute `inputAria` generates. It is lifted out
// and merged through the htmlInput slot instead. Precedence ends up
// derived ARIA < legacy `inputProps` < explicit `slotProps.htmlInput`, so what a
// caller wrote by hand always wins over what this control derives.
function inputSlotProps({
  InputProps,
  slotProps,
  aria,
}: InputSlotSources): UiInputProps['slotProps'] {
  const { inputProps: legacyHtmlInput, ...restInputProps } = InputProps ?? {};
  const withInput: UiInputProps['slotProps'] = InputProps
    ? withLegacyInputSlot(slotProps, restInputProps)
    : slotProps;
  const withLegacy: UiInputProps['slotProps'] = legacyHtmlInput
    ? mergeHtmlInput(withInput, legacyHtmlInput)
    : withInput;
  return aria ? mergeHtmlInput(withLegacy, aria) : withLegacy;
}

const UiInput: React.ForwardRefExoticComponent<
  UiInputProps & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, UiInputProps>((props, ref) => {
  const { InputProps, slotProps, describedBy, ...rest } = props;
  useInputAccessibilityWarnings(props);
  const generatedId: string = React.useId();
  // Only claim an id when this control has ARIA to write, so a field that uses
  // neither `describedBy` nor `required` renders exactly the DOM it renders today.
  // Destructured out of `rest` so it never reaches the DOM, and read here.
  //
  // Gated on `hasText`, not `!= null`: a blank `describedBy` yields no attribute
  // (`inputDescribedBy` trims before testing), so treating it as owned would
  // install an empty ARIA slot and claim an id for nothing.
  const ownsAria: boolean = hasText(describedBy) || rest.required === true;
  const fieldId: string | undefined = ownsAria ? (rest.id ?? generatedId) : rest.id;
  const mergedSlotProps: UiInputProps['slotProps'] = inputSlotProps({
    InputProps,
    slotProps,
    aria: ownsAria ? inputAria(props, fieldId) : null,
  });

  return (
    <ScopedThemeProvider theme={theme}>
      <TextField {...rest} id={fieldId} inputRef={ref} slotProps={mergedSlotProps} />
    </ScopedThemeProvider>
  );
});

UiInput.displayName = DISPLAY_NAME;

export default UiInput;
