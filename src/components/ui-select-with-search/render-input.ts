import type { AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import { createFieldRenderInput } from '../field-controls';
import { GhostOverlay } from '../ghost-overlay';

import type { UiSelectWithSearchProps } from './types';
import type { SelectGhost } from './use-select-ghost';

// The grey inline completion, drawn as an aria-hidden sibling of the input. It stays
// `null` (rather than absent) while hidden so the positioned wrapper is present from
// the first render and the input is never remounted mid-type.
function ghostOverlay(ghost: SelectGhost): React.ReactNode {
  return ghost.active
    ? React.createElement(GhostOverlay, { typed: ghost.typed, completion: ghost.completion })
    : null;
}

// UiSelectWithSearch's `renderInput`: the shared field renderInput bound to the
// control's label/state plus the ghost overlay and its native-input handlers.
export function createSelectRenderInput(
  props: UiSelectWithSearchProps,
  ghost: SelectGhost
): (params: AutocompleteRenderInputParams) => React.ReactElement {
  return createFieldRenderInput({
    label: props.label,
    placeholder: props.placeholder,
    required: props.required,
    error: props.error,
    helperText: props.helperText,
    variant: props.variant,
    ariaLabel: props['aria-label'],
    overlay: ghostOverlay(ghost),
    htmlInputProps: {
      onKeyDown: ghost.handleKeyDown,
      onFocus: ghost.handleFocus,
      onBlur: ghost.handleBlur,
    },
  });
}
