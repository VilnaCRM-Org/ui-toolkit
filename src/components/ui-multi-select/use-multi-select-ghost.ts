import type { AutocompleteInputChangeReason } from '@mui/material';
import React from 'react';

import { isGhostAcceptKey, isPrefixMatch } from '../field-controls';

import type { UiMultiSelectOption } from './types';

export interface MultiSelectGhost {
  /** The live typed text, mirrored into the overlay to position the completion. */
  typed: string;
  /** The grey completion of the first prefix-matching unselected label, or ''. */
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

// The first not-yet-selected option the typed text is a strict prefix of: its
// remainder is the grey completion, and it is the option the accept gesture adds
// to the selection. Already-selected options are skipped so accepting always adds
// a new chip (never a no-op on a value already chosen).
function findGhostMatch(
  options: readonly UiMultiSelectOption[],
  selected: readonly UiMultiSelectOption[],
  typed: string
): UiMultiSelectOption | undefined {
  return options.find(
    option =>
      isPrefixMatch(typed, option.label) &&
      option.label.length > typed.length &&
      !selected.some(picked => picked.value === option.value)
  );
}

// The grey remainder shown after the typed text: everything the matched label has
// beyond what the user has already typed (empty when nothing matches).
function completionOf(match: UiMultiSelectOption | undefined, typed: string): string {
  return match === undefined ? '' : match.label.slice(typed.length);
}

// Tab / ArrowRight-at-end always commit (the shared inline-completion gesture).
// Enter also commits, but only when the user has NOT arrow-navigated to a specific
// listbox option (no `aria-activedescendant`): with a highlight present, Enter must
// stay MUI's own "select the highlighted option", not steal it for the ghost.
function shouldAccept(event: React.KeyboardEvent<HTMLInputElement>): boolean {
  // While an IME composition is active, the Enter/Tab that confirms the composed
  // candidate must reach the input — never commit the ghost chip mid-composition.
  if (event.nativeEvent.isComposing) return false;
  if (isGhostAcceptKey(event)) return true;
  const active: string | null = event.currentTarget.getAttribute('aria-activedescendant');
  return event.key === 'Enter' && (active === null || active === '');
}

// Committing the ghost (Tab / ArrowRight / Enter) adds the matched option and then
// clears the typed text so the next completion starts fresh — the popup stays open
// (multi-select keeps picking), matching MUI's own per-pick reset.
function acceptGhost(
  match: UiMultiSelectOption | undefined,
  commit: (option: UiMultiSelectOption) => void,
  event: React.KeyboardEvent<HTMLInputElement>
): void {
  if (match !== undefined && shouldAccept(event)) {
    event.preventDefault();
    commit(match);
  }
}

// Only user typing feeds the ghost; a reset/clear (blur, pick) empties it so no
// stale completion lingers over the field once a chip is committed.
function typedFrom(value: string, reason: AutocompleteInputChangeReason): string {
  return reason === 'input' ? value : '';
}

// Inline typeahead for the multi-value combobox — parity with UiSearchInput /
// UiSelectWithSearch. The overlay is purely visual; this hook OWNS the typed text
// (the field threads it back as the controlled `inputValue`) and, on the accept
// gesture, appends the matched option through `addOption`.
export function useMultiSelectGhost(
  options: readonly UiMultiSelectOption[],
  selected: readonly UiMultiSelectOption[],
  addOption: (option: UiMultiSelectOption) => void
): MultiSelectGhost {
  const [typed, setTyped] = React.useState<string>('');
  const [focused, setFocused] = React.useState<boolean>(false);

  const match: UiMultiSelectOption | undefined = findGhostMatch(options, selected, typed);
  const completion: string = completionOf(match, typed);

  const commit = (option: UiMultiSelectOption): void => {
    addOption(option);
    setTyped('');
  };

  return {
    typed,
    completion,
    active: focused && completion.length > 0,
    handleInputChange: (_event, value, reason): void => setTyped(typedFrom(value, reason)),
    handleFocus: (): void => setFocused(true),
    handleBlur: (): void => setFocused(false),
    handleKeyDown: (event): void => acceptGhost(match, commit, event),
  };
}
