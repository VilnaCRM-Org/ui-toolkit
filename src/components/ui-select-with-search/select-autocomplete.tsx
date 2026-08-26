import { Autocomplete } from '@mui/material';
import React from 'react';

import { ChevronDownGlyph, OPEN_FIELD_POPPER } from '../field-controls';

import type { UiSelectWithSearchOption, UiSelectWithSearchProps } from './types';
import type { SelectField } from './use-select-field';

const POPUP_ICON: React.ReactElement = <ChevronDownGlyph />;

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
      size={control.size}
      sx={control.sx}
      id={fieldId}
      isOptionEqualToValue={isOptionEqualToValue}
      popupIcon={POPUP_ICON}
      open={field.resolvedOpen}
      onOpen={field.handleOpen}
      onClose={field.handleClose}
      disablePortal={control.disablePortal}
      renderInput={field.renderInput}
      // Demo-only: the frozen popper override keys off the RAW `control.open`
      // (never `field.resolvedOpen`) — a real open must keep Popper flip and
      // overflow handling or the listbox clips near the viewport edge.
      slotProps={control.open ? { ...field.slotProps, popper: OPEN_FIELD_POPPER } : field.slotProps}
    />
  );
}
