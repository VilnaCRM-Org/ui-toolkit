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

// Accepting the ghost (Tab / ArrowRight-at-end) selects the matched option and
// closes the popup — the swallowed key never reaches MUI, so without the explicit
// close the listbox would stay open over a selection MUI was never told about.
// Everything lives INSIDE the accept guard: an ArrowRight with no active ghost
// must not collapse a legitimately open popup mid-browse. `clearTyped` runs
// synchronously too — the MUI `reset` event only fires for controlled parents,
// and without it a stale match would re-arm the accept on every following Tab.
function acceptGhost(
  match: UiSelectWithSearchOption | undefined,
  ghost: { onChange: UiSelectWithSearchProps['onChange']; closePopup: () => void },
  event: React.KeyboardEvent<HTMLInputElement>
): { accepted: boolean } {
  if (match !== undefined && isGhostAcceptKey(event)) {
    event.preventDefault();
    ghost.onChange?.(match);
    ghost.closePopup();
    return { accepted: true };
  }
  return { accepted: false };
}

// Inline typeahead for the single-select combobox (Figma node 448:25572). The
// overlay is purely visual — the input value stays MUI-managed; this hook only
// OBSERVES the typed text (via `onInputChange`) to draw the grey completion.
// `closePopup` is the popup mirror's setter from `useSelectField`.
export function useSelectGhost(
  props: UiSelectWithSearchProps,
  closePopup: () => void
): SelectGhost {
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
    handleKeyDown: (event): void => {
      if (acceptGhost(match, { onChange, closePopup }, event).accepted) {
        setTyped('');
      }
    },
  };
}
