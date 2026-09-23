import { Autocomplete } from '@mui/material';
import React from 'react';

import { ChevronDownGlyph, DEFAULT_LOADING_TEXT, OPEN_FIELD_POPPER } from '../field-controls';

import { multiSelectComboboxSx } from './styles';
import type { UiMultiSelectOption, UiMultiSelectProps } from './types';
import type { MultiListboxSlotProps, MultiSelectField } from './use-multi-select-field';

export interface MultiSelectComboboxProps {
  /** The consumer-facing props of the owning `UiMultiSelect`. */
  config: Readonly<UiMultiSelectProps>;
  /** Handlers and render callbacks derived by `useMultiSelectField`. */
  field: MultiSelectField;
  /** Shared id: labels the field and seeds the combobox/listbox ids. */
  fieldId: string;
}

/** Listbox slot props, plus the pinned popper used by the force-open demo state. */
type MultiSelectSlotProps = MultiListboxSlotProps & { popper?: typeof OPEN_FIELD_POPPER };

export { multiSelectRootSx } from './styles';

const POPUP_ICON: React.ReactElement = <ChevronDownGlyph />;
const EMPTY: UiMultiSelectOption[] = [];

function isOptionEqualToValue(option: UiMultiSelectOption, value: UiMultiSelectOption): boolean {
  return option.value === value.value;
}

function getOptionLabel(option: UiMultiSelectOption): string {
  return option.label;
}

// A force-opened dropdown (demo/visual states only) also pins the popper below the field.
function slotPropsFor(config: UiMultiSelectProps, field: MultiSelectField): MultiSelectSlotProps {
  return config.open ? { ...field.slotProps, popper: OPEN_FIELD_POPPER } : field.slotProps;
}

// The MUI `Autocomplete multiple` element itself, split out of `UiMultiSelect` so
// neither the component shell nor this element sheet exceeds the complexity budget.
// `disableCloseOnSelect` keeps the popup open per pick (the accessible multi-select
// default).
export function MultiSelectCombobox(props: Readonly<MultiSelectComboboxProps>): React.ReactElement {
  const { config, field, fieldId } = props;
  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={config.options}
      value={config.value ?? EMPTY}
      onChange={field.handleChange}
      inputValue={field.text}
      onInputChange={field.handleInputChange}
      disabled={config.disabled}
      // A loading combobox stays fully operable — no `disabled`, no `readOnly`
      // (SC 2.1.1 / 3.2.2). MUI's `loading` only swaps the popup's empty row for
      // `loadingText`, so a running fetch no longer reads as "no options".
      loading={config.loading}
      loadingText={config.loadingText ?? DEFAULT_LOADING_TEXT}
      size={config.size}
      sx={multiSelectComboboxSx(config)}
      id={fieldId}
      isOptionEqualToValue={isOptionEqualToValue}
      getOptionLabel={getOptionLabel}
      popupIcon={POPUP_ICON}
      open={config.open}
      disablePortal={config.disablePortal}
      renderInput={field.renderInput}
      renderValue={field.renderValue}
      renderOption={field.renderOption}
      slotProps={slotPropsFor(config, field)}
    />
  );
}
