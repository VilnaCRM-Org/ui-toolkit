import React from 'react';

import { useDevWarning } from '@/utils/dev-warn';

import { assignTriggerNode } from './menu-focus';
import { useMenuFocusRefs, type MenuFocusContext, type MenuFocusRefs } from './menu-refs';
import {
  buildProfileModel,
  resolveProfileState,
  type ProfileCardState,
  type ProfileSelectCardModel,
} from './profile-select-model';
import { profileSelectWarning } from './profile-select-warnings';
import type { TaskScopedRef } from './task-scoped-ref';
import type { ProfileSelectItem, UiProfileSelectCardProps } from './types';
import { useMenuFocusEffects } from './use-menu-focus-effects';

// Re-exported from the hook that produces it, so components import the model and
// its factory from one place (`useTaskCard`/`TaskCardModel` precedent).
export type { ProfileSelectCardModel } from './profile-select-model';

// ONE close request per gesture (Amendment A2). A single gesture reaches the
// close paths twice — the outside `pointerdown` or the Tab keydown closes, and
// the focus move that same gesture performs then fires the §4.5 focus-out close
// on top of it — so a consumer that keeps `open` true used to be told to close
// twice. The gate is interaction-scoped, never sticky: a consumer that DECLINES
// this close must still receive the next gesture's Escape. An OPEN request
// clears it on the spot, so a close-then-reopen inside one task still works.
function admitsRequest(gate: TaskScopedRef<boolean>, next: boolean): boolean {
  if (next) {
    gate.clear();
    return true;
  }
  if (gate.current === true) {
    return false;
  }
  gate.set(true);
  return true;
}

// Gated once, here: a static or disabled card never requests a state change, so
// no action helper has to re-check either (a11y contract §3.3/§6.1) — and §6.3's
// dominance stays silent rather than self-emitting `onOpenChange(false)`.
//
// The caller collapses both gates into this one argument: `handler` is nullish
// for a static card (§3.3 — no `onOpenChange` at all) and for a disabled one
// (§6.1 — every open path is a no-op), so a single nullish guard decides. A
// second `blocked` flag would make this check unreachable on one side.
function useOpenRequest(
  handler: UiProfileSelectCardProps['onOpenChange'],
  gate: TaskScopedRef<boolean>
): (next: boolean) => void {
  return React.useCallback(
    (next: boolean): void => {
      if (handler != null && admitsRequest(gate, next)) {
        handler(next);
      }
    },
    [gate, handler]
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

export interface MenuRuntimeInput {
  refs: MenuFocusRefs;
  items: ProfileSelectItem[];
  state: ProfileCardState;
  requestOpen: (next: boolean) => void;
  onSelect: ((itemId: string) => void) | undefined;
}

// The action context and the focus effects, in one place. The context identity is
// MEMOISED over its real inputs rather than rebuilt every render: the trigger and
// the menu handlers are `useCallback`s keyed on it, and so is the menu row's own
// click handler, so a churning context made all three memoisations vacuous and
// handed every row a new handler on every commit.
function useMenuRuntime(input: Readonly<MenuRuntimeInput>): MenuFocusContext {
  const { refs, items, state, requestOpen, onSelect } = input;
  const { menuOpen, disabled } = state;
  const ctx: MenuFocusContext = React.useMemo(
    (): MenuFocusContext => ({ refs, open: menuOpen, disabled, requestOpen, onSelect }),
    [disabled, menuOpen, onSelect, refs, requestOpen]
  );
  useMenuFocusEffects({ refs, open: menuOpen, items, requestOpen });
  return ctx;
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
    state.disabled ? undefined : props.onOpenChange,
    refs.closeRequested
  );
  const setTriggerRef: React.RefCallback<HTMLButtonElement> = useTriggerRef(refs, forwardedRef);
  const ctx: MenuFocusContext = useMenuRuntime({
    refs,
    items,
    state,
    requestOpen,
    onSelect: props.onSelect,
  });
  return buildProfileModel({ props, items, ctx, reactId, state, setTriggerRef });
}
