import React from 'react';

import { GhostOverlay } from '../ghost-overlay';

import type { useGhostText } from './use-ghost-text';

type GhostText = ReturnType<typeof useGhostText>;

export function ghostOverlay(ghost: GhostText): React.ReactNode {
  return ghost.active
    ? React.createElement(GhostOverlay, { typed: ghost.text, completion: ghost.completion })
    : null;
}

export function ghostInputProps(ghost: GhostText): {
  onKeyDown: GhostText['handleKeyDown'];
  onFocus: GhostText['handleFocus'];
  onBlur: GhostText['handleBlur'];
} {
  return {
    onKeyDown: ghost.handleKeyDown,
    onFocus: ghost.handleFocus,
    onBlur: ghost.handleBlur,
  };
}
