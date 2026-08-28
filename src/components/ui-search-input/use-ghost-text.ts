import React from 'react';

import { buildGhostText, type GhostText } from './ghost-state';
import type { UiSearchInputProps } from './types';

export type { GhostText };

// Owns the inline-ghost state for the freeSolo search field. The input value is
// kept equal to the typed text at all times; the completion lives only in the
// visual overlay — so MUI's freeSolo never concatenates it into the value.
export function useGhostText(props: UiSearchInputProps): GhostText {
  const [uncontrolledText, setUncontrolledText] = React.useState<string>(props.value ?? '');
  const [focused, setFocused] = React.useState<boolean>(false);

  return buildGhostText({ props, uncontrolledText, setUncontrolledText, focused, setFocused });
}
