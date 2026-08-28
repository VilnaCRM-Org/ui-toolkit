import type React from 'react';

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

/** The current props plus the two pieces of local state `useGhostText` owns. */
export interface GhostTextInput {
  props: UiSearchInputProps;
  uncontrolledText: string;
  setUncontrolledText: (next: string) => void;
  focused: boolean;
  setFocused: (focused: boolean) => void;
}

interface GhostDerivation {
  text: string;
  /** The WHOLE matched option in its own casing, or '' when nothing matches. */
  match: string;
  completion: string;
  active: boolean;
}

// A supplied `value` is authoritative: derive the displayed text from it so typing or
// accepting a ghost cannot diverge from a controlled parent that keeps `value` unchanged.
function deriveGhost(input: GhostTextInput): GhostDerivation {
  const { props } = input;
  const text: string = props.value ?? input.uncontrolledText;
  const match: string = firstGhostMatch(text, props.options ?? EMPTY);
  const completion: string = match.length > 0 ? match.slice(text.length) : '';
  const shown: boolean = input.focused || props.open === true;
  return { text, match, completion, active: shown && completion.length > 0 };
}

// Only mutate local state in the uncontrolled case; a controlled parent owns the value.
function createCommit(input: GhostTextInput): (next: string) => void {
  return (next: string): void => {
    if (input.props.value === undefined) input.setUncontrolledText(next);
    input.props.onChange?.(next);
  };
}

// Accept the ghost (Tab / ArrowRight-at-end) by committing the matched option.
// `preventDefault` cancels the browser's focus/caret move; we deliberately do NOT
// `stopPropagation`, so an ancestor focus-trap or shortcut still sees the key.
function acceptCompletion(
  derived: GhostDerivation,
  event: React.KeyboardEvent<HTMLInputElement>,
  commit: (next: string) => void
): void {
  if (derived.active && isGhostAcceptKey(event)) {
    event.preventDefault();
    // Commit the WHOLE matched option (canonical casing), not text+completion, so a
    // lowercase prefix is corrected on accept (`top` → `Top performers`).
    commit(derived.match);
  }
}

// Assembles the ghost state and its handlers from the props + local state. Kept out
// of the hook itself so neither carries the whole branch/token budget.
export function buildGhostText(input: GhostTextInput): GhostText {
  const derived: GhostDerivation = deriveGhost(input);
  const commit: (next: string) => void = createCommit(input);
  return {
    text: derived.text,
    completion: derived.completion,
    active: derived.active,
    handleInputChange: (_event: React.SyntheticEvent, next: string): void => commit(next),
    handleFocus: (): void => input.setFocused(true),
    handleBlur: (): void => input.setFocused(false),
    handleKeyDown: (event): void => acceptCompletion(derived, event, commit),
  };
}
