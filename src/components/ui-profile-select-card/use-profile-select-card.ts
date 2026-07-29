import React from 'react';

import { useDevWarning } from '@/utils/dev-warn';

import { assignTriggerNode } from './menu-focus';
import { useMenuFocusRefs, type MenuFocusRefs } from './menu-refs';
import {
  buildProfileModel,
  resolveProfileState,
  type ProfileCardState,
  type ProfileSelectCardModel,
} from './profile-select-model';
import { profileSelectWarning } from './profile-select-warnings';
import type { ProfileSelectItem, UiProfileSelectCardProps } from './types';
import { useMenuFocusEffects } from './use-menu-focus-effects';

// Re-exported from the hook that produces it, so components import the model and
// its factory from one place (`useTaskCard`/`TaskCardModel` precedent).
export type { ProfileSelectCardModel } from './profile-select-model';

// Gated once, here: a static or disabled card never requests a state change, so
// no action helper has to re-check either (a11y contract §3.3/§6.1) — and §6.3's
// dominance stays silent rather than self-emitting `onOpenChange(false)`.
//
// The caller collapses both gates into this one argument: `handler` is nullish
// for a static card (§3.3 — no `onOpenChange` at all) and for a disabled one
// (§6.1 — every open path is a no-op), so a single nullish guard decides. A
// second `blocked` flag would make this check unreachable on one side.
function useOpenRequest(
  handler: UiProfileSelectCardProps['onOpenChange']
): (next: boolean) => void {
  return React.useCallback(
    (next: boolean): void => {
      if (handler != null) {
        handler(next);
      }
    },
    [handler]
  );
}

// The forwarded ref lands on the trigger button — never on the wrapper — so a
// consumer can return focus to the card after a dialog closes.
function useTriggerRef(
  refs: MenuFocusRefs,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>
): React.RefCallback<HTMLButtonElement> {
  return React.useCallback(
    (node: HTMLButtonElement | null): void =>
      assignTriggerNode({ forwarded: forwardedRef, own: refs.trigger, node }),
    [forwardedRef, refs]
  );
}

export function useProfileSelectCard(
  props: UiProfileSelectCardProps,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>
): ProfileSelectCardModel {
  const items: ProfileSelectItem[] = props.items ?? [];
  useDevWarning(profileSelectWarning({ props, items }));
  const refs: MenuFocusRefs = useMenuFocusRefs();
  // `useId` must run every render (Rules of Hooks); a caller-supplied `id` wins.
  const reactId: string = React.useId();
  const state: ProfileCardState = resolveProfileState(props, items);
  const requestOpen: (next: boolean) => void = useOpenRequest(
    state.disabled ? undefined : props.onOpenChange
  );
  const setTriggerRef: React.RefCallback<HTMLButtonElement> = useTriggerRef(refs, forwardedRef);
  useMenuFocusEffects({ refs, open: state.menuOpen, requestOpen });
  return buildProfileModel({ props, items, refs, reactId, state, requestOpen, setTriggerRef });
}
