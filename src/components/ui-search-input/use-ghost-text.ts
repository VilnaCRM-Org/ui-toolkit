import React from 'react';

import { firstGhostCompletion, isGhostAcceptKey } from '../field-controls';

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

// Accept the ghost (Tab / ArrowRight-at-end) by committing typed + completion.
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
  const [text, setText] = React.useState<string>(value ?? '');
  const [focused, setFocused] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (value !== undefined) setText(value);
  }, [value]);

  const completion: string = firstGhostCompletion(text, options ?? EMPTY);
  const active: boolean = (focused || open === true) && completion.length > 0;

  const commit = (next: string): void => {
    setText(next);
    onChange?.(next);
  };

  return {
    text,
    completion,
    active,
    handleInputChange: (_event: React.SyntheticEvent, next: string): void => commit(next),
    handleFocus: (): void => setFocused(true),
    handleBlur: (): void => setFocused(false),
    handleKeyDown: (event): void =>
      acceptCompletion(active, event, () => commit(text + completion)),
  };
}
