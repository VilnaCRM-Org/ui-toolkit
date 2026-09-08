import { Autocomplete } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import React from 'react';

import { ChevronDownGlyph, DEFAULT_LOADING_TEXT, OPEN_FIELD_POPPER } from '../field-controls';
import colorTheme from '../ui-color-theme';

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

const POPUP_ICON: React.ReactElement = <ChevronDownGlyph />;
const EMPTY: UiMultiSelectOption[] = [];
// Figma "Multiselect": the empty field stroke is grey400 #D0D4D8 (set in the theme);
// once chips fill it the stroke is grey300 #969B9D (the filled/"active" node
// 535:37491). Hover is grey300 for BOTH the empty and the filled field (node
// 535:37484) and is handled by the theme, so the filled state only needs its darker
// resting stroke here.
const FILLED_STROKE_SX: SystemStyleObject<Theme> = {
  '& .MuiOutlinedInput-notchedOutline': { borderColor: colorTheme.palette.grey300.main },
};

function isOptionEqualToValue(option: UiMultiSelectOption, value: UiMultiSelectOption): boolean {
  return option.value === value.value;
}

function getOptionLabel(option: UiMultiSelectOption): string {
  return option.label;
}

// While a fetch is in flight the arc takes the clear-all ×'s slot, so the × is
// hidden underneath — the same swap UiSelectWithSearch makes, so the busy state
// looks identical across the two selects. The × is Figma-mandated always-visible
// in the RESTING field (node 622:44553) and stays so; this suppresses it only
// for the duration of the fetch.
const HIDE_CLEAR_SX: SystemStyleObject<Theme> = {
  '& .MuiAutocomplete-clearIndicator': { display: 'none' },
};

// Both derived layers sit UNDER the consumer `sx` so a consumer override still
// wins; an untouched field passes the consumer value through unchanged.
export function multiSelectRootSx(config: UiMultiSelectProps): SxProps<Theme> {
  const consumerSx: SxProps<Theme> = config.sx ?? {};
  const derived: SystemStyleObject<Theme>[] = [
    ...((config.value ?? EMPTY).length > 0 ? [FILLED_STROKE_SX] : []),
    ...(config.loading === true ? [HIDE_CLEAR_SX] : []),
  ];
  if (derived.length === 0) {
    return consumerSx;
  }
  return [...derived, ...(Array.isArray(consumerSx) ? consumerSx : [consumerSx])];
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
      sx={multiSelectRootSx(config)}
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
