import type { AutocompleteInputChangeReason, AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import {
  useFieldLoadingAnnouncement,
  useListboxSlotProps,
  type ListboxSlotProps,
} from '../field-controls';

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
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactElement;
  slotProps: ListboxSlotProps;
  /** Polite live-region text: empty until a fetch crosses the announce delay. */
  announced: string;
}

// Derives the change handler, the `renderInput` callback (with the inline ghost
// overlay and its input handlers) and listbox slotProps for UiSelectWithSearch,
// keeping the component itself small enough for the complexity gate.
export function useSelectField(props: UiSelectWithSearchProps): SelectField {
  const onChange: UiSelectWithSearchProps['onChange'] = props.onChange;
  const ghost: ReturnType<typeof useSelectGhost> = useSelectGhost(props);

  const handleChange: SelectField['handleChange'] = React.useCallback(
    (_event: React.SyntheticEvent, next: UiSelectWithSearchOption | null): void => {
      onChange?.(next);
    },
    [onChange]
  );

  const announced: string = useFieldLoadingAnnouncement(props);
  const renderInput: SelectField['renderInput'] = createSelectRenderInput(props, ghost);
  const slotProps: ListboxSlotProps = useListboxSlotProps(props.label, props['aria-label']);

  return {
    handleChange,
    handleInputChange: ghost.handleInputChange,
    renderInput,
    slotProps,
    announced,
  };
}
