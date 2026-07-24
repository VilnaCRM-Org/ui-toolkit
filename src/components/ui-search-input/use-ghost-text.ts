import React from 'react';

import { firstGhostMatch, isGhostAcceptKey } from '../field-controls';

import type { UiSearchInputProps } from './types';

const EMPTY: string[] = [];

export interface GhostText {
  /** The live typed value — always exactly what the user typed (never the completion). */
  text: string;
  /** The grey completion of the first prefix-matching option, or '' when none. */
  completion: string;
  /** Whether the ghost is currently shown (focused or force-open, and a completion exists). */
  active: boolean;
  handleInputChange: (event: React.SyntheticEvent, next: string) => void;
  handleFocus: () => void;
  handleBlur: () => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

// Accept the ghost (Tab / ArrowRight-at-end) by committing the matched option.
// `preventDefault` cancels the browser's focus/caret move; we deliberately do NOT
// `stopPropagation`, so an ancestor focus-trap or shortcut still sees the key.
function acceptCompletion(
  active: boolean,
  event: React.KeyboardEvent<HTMLInputElement>,
  commit: () => void
): void {
  if (active && isGhostAcceptKey(event)) {
    event.preventDefault();
    commit();
  }
}

// Owns the inline-ghost state for the freeSolo search field. The input value is
// kept equal to the typed text at all times; the completion lives only in the
// visual overlay — so MUI's freeSolo never concatenates it into the value.
export function useGhostText(props: UiSearchInputProps): GhostText {
  const { value, onChange, options, open } = props;
  const [uncontrolledText, setUncontrolledText] = React.useState<string>(value ?? '');
  const [focused, setFocused] = React.useState<boolean>(false);
  // A supplied `value` is authoritative: derive the displayed text from it and only
  // mutate local state in the uncontrolled case, so typing or accepting a ghost cannot
  // diverge from a controlled parent that keeps `value` unchanged.
  const text: string = value ?? uncontrolledText;

  const match: string = firstGhostMatch(text, options ?? EMPTY);
  const completion: string = match.length > 0 ? match.slice(text.length) : '';
  const active: boolean = (focused || open === true) && completion.length > 0;

  const commit = (next: string): void => {
    if (value === undefined) setUncontrolledText(next);
    onChange?.(next);
  };

  return {
    text,
    completion,
    active,
    handleInputChange: (_event: React.SyntheticEvent, next: string): void => commit(next),
    handleFocus: (): void => setFocused(true),
    handleBlur: (): void => setFocused(false),
    // Commit the WHOLE matched option (canonical casing), not text+completion, so a
    // lowercase prefix is corrected on accept (`top` → `Top performers`).
    handleKeyDown: (event): void => acceptCompletion(active, event, () => commit(match)),
  };
}
