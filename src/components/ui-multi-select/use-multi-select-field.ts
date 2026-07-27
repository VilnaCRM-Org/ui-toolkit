import type { AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import {
  createFieldOptionRenderer,
  createFieldRenderInput,
  GhostOverlay,
  hasText,
  type FieldOptionRenderer,
} from '../field-controls';

import { announceChange } from './announce';
import { createChipRenderer, type ChipRenderer } from './chip-renderer';
import type { UiMultiSelectOption, UiMultiSelectProps } from './types';
import { useMultiSelectGhost, type MultiSelectGhost } from './use-multi-select-ghost';

/** Listbox slot props: named from the field, and multi-selectable (MUI omits this). */
export interface MultiListboxSlotProps {
  listbox: { 'aria-label'?: string; 'aria-multiselectable': true };
}

export interface MultiSelectField {
  status: string;
  /** The controlled typed text (the ghost owns it), threaded back as `inputValue`. */
  text: string;
  handleChange: (event: React.SyntheticEvent, next: UiMultiSelectOption[]) => void;
  handleInputChange: MultiSelectGhost['handleInputChange'];
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactElement;
  renderValue: ChipRenderer;
  renderOption: FieldOptionRenderer<UiMultiSelectOption>;
  slotProps: MultiListboxSlotProps;
}

const EMPTY: UiMultiSelectOption[] = [];

// Every option row renders the same way (typed prefix + grey completion), so the
// renderer is built once at module scope rather than per render.
const RENDER_OPTION: FieldOptionRenderer<UiMultiSelectOption> =
  createFieldOptionRenderer<UiMultiSelectOption>(option => option.label);

// The inline ghost overlay, shown only while a completion is active (kept out of the
// hook so the hook stays under the metrics budget).
function ghostOverlay(ghost: MultiSelectGhost): React.ReactNode {
  return ghost.active
    ? React.createElement(GhostOverlay, { typed: ghost.typed, completion: ghost.completion })
    : null;
}

// Names the popup listbox from the visible label, falling back to `aria-label`
// (including when `label` is empty/whitespace), and marks it multi-selectable —
// MUI leaves `aria-multiselectable` off even for `Autocomplete multiple`.
function listboxSlotProps(props: UiMultiSelectProps): MultiListboxSlotProps {
  const label: string | undefined = props.label;
  const named: string | undefined = hasText(label) ? label : props['aria-label'];
  return { listbox: { 'aria-label': named, 'aria-multiselectable': true } };
}

// The `renderInput` factory, wired with the ghost overlay + its input key/focus
// handlers. Placeholder shows only while empty; `required` is native only while empty
// so a filled multi-select does not spuriously block submit (§4.4 of the spec).
function buildRenderInput(
  props: UiMultiSelectProps,
  ghost: MultiSelectGhost
): (params: AutocompleteRenderInputParams) => React.ReactElement {
  const filled: boolean = (props.value ?? EMPTY).length > 0;
  return createFieldRenderInput({
    label: props.label,
    variant: props.variant,
    error: props.error,
    helperText: props.helperText,
    ariaLabel: props['aria-label'],
    placeholder: filled ? undefined : props.placeholder,
    required: props.required === true && !filled,
    overlay: ghostOverlay(ghost),
    htmlInputProps: {
      onKeyDown: ghost.handleKeyDown,
      onFocus: ghost.handleFocus,
      onBlur: ghost.handleBlur,
    },
  });
}

// Derives the change handler (which also updates the live-region status), the
// controlled input text + its ghost typeahead, and the render callbacks / listbox
// slot props for UiMultiSelect, keeping the component itself small for the
// complexity gate. These are cheap to build and MUI calls them every render, so
// they are not memoised (memo dependency lists would otherwise blow the budget).
export function useMultiSelectField(props: UiMultiSelectProps): MultiSelectField {
  const { value, onChange } = props;
  const selected: UiMultiSelectOption[] = value ?? EMPTY;
  const [status, setStatus] = React.useState<string>('');

  const applySelection = (next: UiMultiSelectOption[]): void => {
    onChange?.(next);
    setStatus(announceChange(selected, next));
  };
  const ghost: MultiSelectGhost = useMultiSelectGhost(props.options, selected, option =>
    applySelection([...selected, option])
  );

  return {
    status,
    text: ghost.typed,
    handleChange: (_event, next): void => applySelection(next),
    handleInputChange: ghost.handleInputChange,
    renderInput: buildRenderInput(props, ghost),
    renderValue: createChipRenderer(props.disabled === true),
    renderOption: RENDER_OPTION,
    slotProps: listboxSlotProps(props),
  };
}
