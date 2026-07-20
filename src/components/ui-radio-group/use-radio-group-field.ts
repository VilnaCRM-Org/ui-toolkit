import React from 'react';

import { hasText } from '../field-controls';

import type { UiRadioGroupProps } from './types';

export interface RadioGroupField {
  labelId: string;
  helperTextId: string | undefined;
  named: boolean;
  ariaLabel: string | undefined;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>, next: string) => void;
}

// Derives the label/helper ids, the resolved accessible-name source, and the
// change handler (adapting MUI's `(event, value)` signature to the shared
// `onChange(value)` contract) for UiRadioGroup, keeping the component itself
// small for the complexity gate.
export function useRadioGroupField(props: UiRadioGroupProps): RadioGroupField {
  const { id, helperText, label, onChange } = props;
  // `useId` must run every render (Rules of Hooks); the caller-supplied `id`
  // wins for the generated ids when present.
  const reactId: string = React.useId();
  const baseId: string = id ?? reactId;
  const named: boolean = hasText(label);

  const handleChange: RadioGroupField['handleChange'] = (_event, next): void => {
    onChange?.(next);
  };

  return {
    labelId: `${baseId}-label`,
    helperTextId: helperText ? `${baseId}-helper-text` : undefined,
    named,
    ariaLabel: named ? undefined : props['aria-label'],
    handleChange,
  };
}
