import type { AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import {
  createFieldOptionRenderer,
  createFieldRenderInput,
  hasText,
  type FieldOptionRenderer,
} from '../field-controls';

import { announceChange } from './announce';
import { createChipRenderer, type ChipRenderer } from './chip-renderer';
import type { UiMultiSelectOption, UiMultiSelectProps } from './types';

/** Listbox slot props: named from the field, and multi-selectable (MUI omits this). */
export interface MultiListboxSlotProps {
  listbox: { 'aria-label'?: string; 'aria-multiselectable': true };
}

export interface MultiSelectField {
  status: string;
  handleChange: (event: React.SyntheticEvent, next: UiMultiSelectOption[]) => void;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactElement;
  renderValue: ChipRenderer;
  renderOption: FieldOptionRenderer<UiMultiSelectOption>;
  slotProps: MultiListboxSlotProps;
}

const EMPTY: UiMultiSelectOption[] = [];

// Derives the change handler (which also updates the live-region status), the
// `renderInput`/`renderValue` callbacks and the listbox slot props for
// UiMultiSelect, keeping the component itself small for the complexity gate.
// These are cheap to build and MUI calls them every render, so they are not
// memoised (memo dependency lists would otherwise blow the complexity budget).
export function useMultiSelectField(props: UiMultiSelectProps): MultiSelectField {
  const { value, onChange, label, placeholder, required, error, helperText, variant, disabled } =
    props;
  const ariaLabel: string | undefined = props['aria-label'];
  const selectedCount: number = (value ?? EMPTY).length;
  const [status, setStatus] = React.useState<string>('');

  const handleChange: MultiSelectField['handleChange'] = (_event, next): void => {
    onChange?.(next);
    setStatus(announceChange(value ?? EMPTY, next));
  };

  // Placeholder only while empty; `required` is native only while empty so a
  // filled multi-select does not spuriously block submit (§4.4 of the spec).
  const renderInput: MultiSelectField['renderInput'] = createFieldRenderInput({
    label,
    variant,
    error,
    helperText,
    ariaLabel,
    placeholder: selectedCount === 0 ? placeholder : undefined,
    required: required === true && selectedCount === 0,
  });

  const renderValue: ChipRenderer = createChipRenderer(disabled === true);

  // Dropdown rows split into a dark typed prefix + grey completion (Figma 535:37501).
  const renderOption: FieldOptionRenderer<UiMultiSelectOption> =
    createFieldOptionRenderer<UiMultiSelectOption>(option => option.label);

  const slotProps: MultiListboxSlotProps = {
    listbox: { 'aria-label': hasText(label) ? label : ariaLabel, 'aria-multiselectable': true },
  };

  return { status, handleChange, renderInput, renderValue, renderOption, slotProps };
}
