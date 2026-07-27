import type { AutocompleteInputChangeReason } from '@mui/material';
import React from 'react';

import { isGhostAcceptKey, isPrefixMatch } from '../field-controls';

import type { UiSelectWithSearchOption, UiSelectWithSearchProps } from './types';

export interface SelectGhost {
  /** The live typed text, mirrored into the overlay to position the caret. */
  typed: string;
  /** The grey completion of the first prefix-matching option label, or '' when none. */
  completion: string;
  /** Whether the ghost is currently shown (focused and a completion exists). */
  active: boolean;
  handleInputChange: (
    event: React.SyntheticEvent,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => void;
  handleFocus: () => void;
  handleBlur: () => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

// The first option the typed text is a strict prefix of: its remainder is the grey
// completion, and it is the option the accept gesture selects.
function findGhostMatch(
  options: readonly UiSelectWithSearchOption[],
  typed: string
): UiSelectWithSearchOption | undefined {
  return options.find(
    option => isPrefixMatch(typed, option.label) && option.label.length > typed.length
  );
}

// Accepting the ghost (Tab / ArrowRight-at-end) selects the matched option; MUI then
// shows its label and the completion clears on the resulting reset event.
function acceptGhost(
  match: UiSelectWithSearchOption | undefined,
  onChange: UiSelectWithSearchProps['onChange'],
  event: React.KeyboardEvent<HTMLInputElement>
): void {
  if (match !== undefined && isGhostAcceptKey(event)) {
    event.preventDefault();
    onChange?.(match);
  }
}

// Inline typeahead for the single-select combobox (Figma node 448:25572). The
// overlay is purely visual — the input value stays MUI-managed; this hook only
// OBSERVES the typed text (via `onInputChange`) to draw the grey completion.
export function useSelectGhost(props: UiSelectWithSearchProps): SelectGhost {
  const { options, onChange } = props;
  const [typed, setTyped] = React.useState<string>('');
  const [focused, setFocused] = React.useState<boolean>(false);

  const match: UiSelectWithSearchOption | undefined = findGhostMatch(options, typed);
  const completion: string = match === undefined ? '' : match.label.slice(typed.length);
  const active: boolean = focused && completion.length > 0;

  return {
    typed,
    completion,
    active,
    // Only user typing feeds the ghost; a reset/clear (blur, selection) empties it so
    // no stale completion lingers over a committed value.
    handleInputChange: (_event, value, reason): void => setTyped(reason === 'input' ? value : ''),
    handleFocus: (): void => setFocused(true),
    handleBlur: (): void => setFocused(false),
    handleKeyDown: (event): void => acceptGhost(match, onChange, event),
  };
}
