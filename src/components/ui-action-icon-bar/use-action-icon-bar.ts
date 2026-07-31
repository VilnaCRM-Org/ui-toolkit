import { useDevWarning } from '@/utils/dev-warn';

import actionIconBarWarning from './action-icon-bar-warnings';
import type { UiActionIconBarAction, UiActionIconBarProps } from './types';
import { isWiredAction } from './use-action-state';

// The bar-level view model. It keeps the component thin: the wired/static split
// and the always-controlled, bar-wide disabled axis both live here.
export interface ActionIconBarModel {
  /** True when ANY action is wired — the root then renders `role="group"` (S2). */
  interactive: boolean;
  /** Bar-wide disable, ORed into every action's own flag by `useActionState`. */
  disabled: boolean;
  /** The actions to paint, normalised so a nullish array cannot crash the map. */
  actions: readonly UiActionIconBarAction[];
}

/**
 * Derives the bar model and emits the first applicable dev warning. Nothing here
 * is stored: the bar holds no state of its own, moves focus for nobody, and
 * never self-flips a toggle — the next state is always fed back through the
 * consumer's callbacks (S3).
 */
export function useActionIconBar(props: UiActionIconBarProps): ActionIconBarModel {
  useDevWarning(actionIconBarWarning(props));
  const actions: readonly UiActionIconBarAction[] = props.actions ?? [];
  return {
    interactive: actions.some(isWiredAction),
    disabled: props.disabled ?? false,
    actions,
  };
}
