import type { AutocompleteRenderInputParams, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import type React from 'react';

import { useUiTheme } from '@/utils/ui-theme';

import {
  useFieldLoadingAnnouncement,
  useListboxSlotProps,
  type ListboxSlotProps,
} from '../field-controls';

import { createSearchRenderInput } from './render-input';
import { ghostInputProps, ghostOverlay } from './search-field-parts';
import { SEARCH_AUTOCOMPLETE_SX, searchFieldSlotStyles, searchSlotProps } from './styles';
import type { UiSearchInputProps } from './types';
import { useGhostText } from './use-ghost-text';

export interface SearchField {
  text: string;
  handleInputChange: (event: React.SyntheticEvent, next: string) => void;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactElement;
  slotProps: ReturnType<typeof searchSlotProps>;
  rootSx: SystemStyleObject<Theme>;
  announced: string;
}

export function useSearchField(props: UiSearchInputProps): SearchField {
  const { label, placeholder, required, error, helperText } = props;
  const ariaLabel: string | undefined = props['aria-label'];
  const theme: Theme = useUiTheme();
  const ghost: ReturnType<typeof useGhostText> = useGhostText(props);

  const announced: string = useFieldLoadingAnnouncement(props);

  const renderInput: SearchField['renderInput'] = createSearchRenderInput({
    label,
    placeholder,
    required,
    error,
    helperText,
    ariaLabel,
    overlay: ghostOverlay(ghost),
    loading: props.loading,
    slotStyles: searchFieldSlotStyles(theme),
    htmlInputProps: ghostInputProps(ghost),
  });

  const listbox: ListboxSlotProps = useListboxSlotProps(label, ariaLabel);

  return {
    text: ghost.text,
    handleInputChange: ghost.handleInputChange,
    renderInput,
    slotProps: searchSlotProps(theme, listbox, props.open),
    rootSx: SEARCH_AUTOCOMPLETE_SX,
    announced,
  };
}
