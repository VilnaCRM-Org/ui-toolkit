import { Autocomplete } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import React from 'react';

import { ChevronDownGlyph, DEFAULT_LOADING_TEXT, OPEN_FIELD_POPPER } from '../field-controls';

import type { UiSelectWithSearchOption, UiSelectWithSearchProps } from './types';
import type { SelectField } from './use-select-field';

const POPUP_ICON: React.ReactElement = <ChevronDownGlyph />;

// While a fetch is in flight the spinner takes the clear ×'s slot, so the ×
// itself is hidden. Safe rather than merely tidy: MUI gives the clear button
// `tabIndex={-1}`, so it never sat in the tab order and hiding it cannot break a
// Tab sequence. Layered UNDER the consumer `sx` so a consumer override still wins.
const HIDE_CLEAR_SX: SystemStyleObject<Theme> = {
  '& .MuiAutocomplete-clearIndicator': { display: 'none' },
};

export function selectRootSx(control: UiSelectWithSearchProps): SxProps<Theme> | undefined {
  if (control.loading !== true) {
    return control.sx;
  }
  const consumerSx: SxProps<Theme> = control.sx ?? {};
  return [HIDE_CLEAR_SX, ...(Array.isArray(consumerSx) ? consumerSx : [consumerSx])];
}

function isOptionEqualToValue(
  option: UiSelectWithSearchOption,
  value: UiSelectWithSearchOption
): boolean {
  return option.value === value.value;
}

export interface SelectAutocompleteProps {
  /** The public props of the owning control, passed through unchanged. */
  control: UiSelectWithSearchProps;
  /** Shared id of the combobox, so an external `<label htmlFor>` still binds. */
  fieldId: string;
  /** Handlers, `renderInput` and listbox slotProps derived by `useSelectField`. */
  field: SelectField;
}

// The combobox itself, kept in its own module so the owning component stays within
// the per-function complexity budget. Props are applied explicitly (no JSX spread),
// so the rendered MUI wiring is identical to an inline `<Autocomplete>`.
export function SelectAutocomplete(props: Readonly<SelectAutocompleteProps>): React.ReactElement {
  const { control, fieldId, field } = props;
  return (
    <Autocomplete
      options={control.options}
      value={control.value ?? null}
      onChange={field.handleChange}
      onInputChange={field.handleInputChange}
      disabled={control.disabled}
      // A loading combobox stays fully operable — no `disabled`, no `readOnly`
      // (SC 2.1.1 / 3.2.2). MUI's `loading` only swaps the popup's empty row for
      // `loadingText`, so a running fetch no longer reads as "no options".
      loading={control.loading}
      loadingText={control.loadingText ?? DEFAULT_LOADING_TEXT}
      size={control.size}
      sx={selectRootSx(control)}
      id={fieldId}
      isOptionEqualToValue={isOptionEqualToValue}
      popupIcon={POPUP_ICON}
      open={control.open}
      disablePortal={control.disablePortal}
      renderInput={field.renderInput}
      slotProps={control.open ? { ...field.slotProps, popper: OPEN_FIELD_POPPER } : field.slotProps}
    />
  );
}
