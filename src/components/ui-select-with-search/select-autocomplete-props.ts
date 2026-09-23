import type { SxProps, Theme } from '@mui/material';
import type React from 'react';

import { DEFAULT_LOADING_TEXT } from '../field-controls';

import { selectSlotProps } from './slot-styles';
import { selectSx } from './styles';
import type { UiSelectWithSearchOption, UiSelectWithSearchProps } from './types';
import type { SelectField } from './use-select-field';

const DEFAULT_CLEAR_LABEL: string = 'Очистити';

function clearText(
  value: UiSelectWithSearchOption | null | undefined,
  clearLabel: string | undefined
): string {
  const base: string = clearLabel ?? DEFAULT_CLEAR_LABEL;
  return value ? `${base} ${value.label}` : base;
}

export function isOptionEqualToValue(
  option: UiSelectWithSearchOption,
  value: UiSelectWithSearchOption
): boolean {
  return option.value === value.value;
}

export interface SelectAutocompleteDerived {
  value: UiSelectWithSearchOption | null;
  loadingText: React.ReactNode;
  sx: SxProps<Theme>;
  clearText: string;
  slotProps: ReturnType<typeof selectSlotProps>;
}

export function deriveSelectAutocomplete(
  theme: Theme,
  control: UiSelectWithSearchProps,
  field: SelectField
): SelectAutocompleteDerived {
  return {
    value: control.value ?? null,
    loadingText: control.loadingText ?? DEFAULT_LOADING_TEXT,
    sx: selectSx(theme, control),
    clearText: clearText(control.value, control.clearLabel),
    slotProps: selectSlotProps(theme, control, field),
  };
}
