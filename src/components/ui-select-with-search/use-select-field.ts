import type { AutocompleteInputChangeReason, AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import { useListboxSlotProps, type ListboxSlotProps } from '../field-controls';

import { createSelectRenderInput } from './render-input';
import type { UiSelectWithSearchOption, UiSelectWithSearchProps } from './types';
import { useSelectGhost } from './use-select-ghost';

export interface SelectField {
  handleChange: (event: React.SyntheticEvent, next: UiSelectWithSearchOption | null) => void;
  handleInputChange: (
    event: React.SyntheticEvent,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => void;
  handleOpen: () => void;
  handleClose: () => void;
  /**
   * The popup's resolved open state: the demo `open` passthrough when forced,
   * otherwise the controlled mirror of MUI's own open/close triggers. Distinct
   * from the RAW `props.open` on purpose — the demo popper override must key off
   * the raw prop only (a real open must keep Popper flip/overflow behaviour).
   */
  resolvedOpen: boolean;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactElement;
  slotProps: ListboxSlotProps;
}

// Derives the change handler, the `renderInput` callback (with the inline ghost
// overlay and its input handlers), the controlled popup mirror and listbox
// slotProps for UiSelectWithSearch, keeping the component itself small enough
// for the complexity gate. The mirror exists so the ghost-accept gesture — whose
// swallowed key never reaches MUI — can close the popup like a real selection.
export function useSelectField(props: UiSelectWithSearchProps): SelectField {
  const onChange: UiSelectWithSearchProps['onChange'] = props.onChange;
  const [popupOpen, setPopupOpen] = React.useState<boolean>(false);
  const handleOpen: () => void = React.useCallback((): void => setPopupOpen(true), []);
  const handleClose: () => void = React.useCallback((): void => setPopupOpen(false), []);
  const ghost: ReturnType<typeof useSelectGhost> = useSelectGhost(props, handleClose);

  const handleChange: SelectField['handleChange'] = React.useCallback(
    (_event: React.SyntheticEvent, next: UiSelectWithSearchOption | null): void => {
      onChange?.(next);
    },
    [onChange]
  );

  const renderInput: SelectField['renderInput'] = createSelectRenderInput(props, ghost);
  const slotProps: ListboxSlotProps = useListboxSlotProps(props.label, props['aria-label']);

  return {
    handleChange,
    handleInputChange: ghost.handleInputChange,
    handleOpen,
    handleClose,
    resolvedOpen: props.open ?? popupOpen,
    renderInput,
    slotProps,
  };
}
