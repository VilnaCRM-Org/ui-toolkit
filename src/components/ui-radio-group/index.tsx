import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import React from 'react';

import radioStyles from './styles';
import type { UiRadioGroupProps, UiRadioOption } from './types';
import { useRadioGroupField, type RadioGroupField } from './use-radio-group-field';
import { useRadioGroupWarnings } from './use-warnings';

const UNCHECKED_ICON: React.ReactElement = <span className="ui-radio-dot" />;
const CHECKED_ICON: React.ReactElement = <span className="ui-radio-dot ui-radio-dot--checked" />;

function renderRadio(error: boolean, required: boolean): React.ReactElement {
  return (
    <Radio
      disableRipple
      required={required}
      icon={UNCHECKED_ICON}
      checkedIcon={CHECKED_ICON}
      sx={error ? radioStyles.radioError : radioStyles.radio}
    />
  );
}

function renderOption(option: UiRadioOption, control: React.ReactElement): React.ReactElement {
  return (
    <FormControlLabel
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      control={control}
      label={option.label}
    />
  );
}

function renderGroupLabel(labelId: string, label: string | undefined): React.ReactElement {
  return (
    <FormLabel id={labelId} sx={radioStyles.groupLabel}>
      {label}
    </FormLabel>
  );
}

function renderHelper(id: string | undefined, helperText: React.ReactNode): React.ReactElement {
  return <FormHelperText id={id}>{helperText}</FormHelperText>;
}

// Split out of UiRadioGroup so no single function exceeds the Halstead-volume
// complexity budget; carries the group's roving-focus radios plus its aria wiring.
function renderRadioGroup(
  props: UiRadioGroupProps,
  field: RadioGroupField,
  control: React.ReactElement
): React.ReactElement {
  return (
    <RadioGroup
      row={props.row}
      name={props.name}
      value={props.value ?? ''}
      onChange={field.handleChange}
      aria-labelledby={field.named ? field.labelId : undefined}
      aria-label={field.ariaLabel}
      aria-describedby={field.helperTextId}
      aria-invalid={props.error === true ? true : undefined}
    >
      {props.options.map((option: UiRadioOption) => renderOption(option, control))}
    </RadioGroup>
  );
}

// Single-choice radio group: options render as MUI radios inside a named
// `role="radiogroup"`. Built on MUI `RadioGroup` (native roving-focus arrow-key
// selection); the raw `(event, value)` change signature is adapted to a clean
// `onChange(value)`. The group owns its accessible name (`label` → `FormLabel` +
// `aria-labelledby`, else `aria-label`), `error` → `aria-invalid`, `helperText`
// → `aria-describedby`, and native `required`.
function UiRadioGroup(props: Readonly<UiRadioGroupProps>): React.ReactElement {
  useRadioGroupWarnings(props);
  const { disabled, error, required, sx, label, helperText } = props;
  const field: RadioGroupField = useRadioGroupField(props);
  const control: React.ReactElement = renderRadio(error === true, required === true);

  return (
    <FormControl error={error} disabled={disabled} required={required} sx={sx}>
      {field.named ? renderGroupLabel(field.labelId, label) : null}
      {renderRadioGroup(props, field, control)}
      {helperText ? renderHelper(field.helperTextId, helperText) : null}
    </FormControl>
  );
}

UiRadioGroup.displayName = 'UiRadioGroup';

export default UiRadioGroup;
