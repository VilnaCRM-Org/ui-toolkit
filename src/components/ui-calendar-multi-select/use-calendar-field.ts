import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { hasText } from '../field-controls';

import { mergeRootSx } from './styles';
import type { CalendarSize } from './styles';
import type { UiCalendarMultiSelectProps } from './types';

export interface CalendarField {
  labelId: string;
  captionId: string;
  helperId: string;
  hasVisibleLabel: boolean;
  labelledBy?: string;
  ariaLabel?: string;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  size: CalendarSize;
  describedBy?: string;
  sx: SxProps<Theme>;
}

/** Appends " required" to an accessible name so a label-less field still announces it. */
function appendRequired(name: string | undefined, required: boolean): string | undefined {
  if (name == null || !required) {
    return name;
  }
  return `${name} required`;
}

// Derives the ids, ARIA wiring, resolved contract flags and merged `sx` the
// component renders from — kept out of the component so each stays small.
export function useCalendarField(props: UiCalendarMultiSelectProps): CalendarField {
  const reactId: string = React.useId();
  const base: string = props.id != null && props.id.trim() !== '' ? props.id : reactId;
  const disabled: boolean = props.disabled ?? false;
  const required: boolean = props.required ?? false;
  const hasVisibleLabel: boolean = hasText(props.label);
  const labelId: string = `${base}-label`;
  const helperId: string = `${base}-helper-text`;

  return {
    labelId,
    captionId: `${base}-caption`,
    helperId,
    hasVisibleLabel,
    labelledBy: hasVisibleLabel ? labelId : undefined,
    ariaLabel: hasVisibleLabel ? undefined : appendRequired(props['aria-label'], required),
    disabled,
    required,
    invalid: (props.error ?? false) && !disabled,
    size: props.size ?? 'medium',
    describedBy: props.helperText != null ? helperId : undefined,
    sx: mergeRootSx(props.sx),
  };
}
