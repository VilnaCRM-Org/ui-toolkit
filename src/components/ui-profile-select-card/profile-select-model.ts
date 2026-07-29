import type { SxProps, Theme } from '@mui/material';
import type React from 'react';

import type { MenuFocusContext, MenuFocusRefs } from './menu-refs';
import { profileTriggerSx } from './styles';
import type { ProfileSelectItem, UiProfileSelectCardProps } from './types';

/**
 * The view model the card renders from. It keeps the components thin: the
 * wired/static split, the id wiring, the `aria-disabled` boundary and the
 * disabled-over-open dominance all resolve here.
 */
export interface ProfileSelectCardModel {
  /** True when `onOpenChange` is present — the card renders as a native button. */
  interactive: boolean;
  /** True exactly while the `role="menu"` element is mounted. */
  menuOpen: boolean;
  /** The trigger `id`: the consumer's if given, else a generated one. */
  triggerId: string;
  menuId: string;
  /** `aria-expanded` for a wired trigger; `undefined` (absent) for a static card. */
  ariaExpanded: boolean | undefined;
  /** `aria-controls` only while the menu is mounted — never a dangling idref. */
  ariaControls: string | undefined;
  /** `aria-disabled` for a disabled wired trigger; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** The photo to paint, or null when no usable source was given. */
  avatarSrc: string | null;
  /** The resolved trigger recipe; both the wired and the static shell paint it. */
  triggerSx: SxProps<Theme>;
  items: ProfileSelectItem[];
  ctx: MenuFocusContext;
  /** Callback ref for the trigger button; also feeds the consumer's forwarded ref. */
  setTriggerRef: React.RefCallback<HTMLButtonElement>;
}

/** The three booleans every branch in the card is derived from. */
export interface ProfileCardState {
  interactive: boolean;
  disabled: boolean;
  menuOpen: boolean;
}

// Accepts a URL string or a static import (`{ src }`). The optional chain absorbs
// a runtime nullish `avatarSrc`, which the strict prop type forbids but API/CMS
// data does not.
function resolveAvatarSrc(source: UiProfileSelectCardProps['avatarSrc']): string | null {
  if (typeof source === 'string') {
    return source || null;
  }
  return source?.src || null;
}

/**
 * `disabled` dominates `open` (a11y contract §6.3) and an empty list renders no
 * menu at all (§3.4), so the effective open state — and therefore
 * `aria-expanded` — always describes a menu that is really in the DOM.
 */
export function resolveProfileState(
  props: UiProfileSelectCardProps,
  items: ProfileSelectItem[]
): ProfileCardState {
  const interactive: boolean = props.onOpenChange != null;
  const disabled: boolean = props.disabled ?? false;
  const requested: boolean = props.open ?? false;
  return {
    interactive,
    disabled,
    menuOpen: interactive && !disabled && requested && items.length > 0,
  };
}

export interface ProfileModelInput {
  props: UiProfileSelectCardProps;
  items: ProfileSelectItem[];
  refs: MenuFocusRefs;
  /** The `useId` value; names the menu and backs an omitted consumer `id` (§2.5). */
  reactId: string;
  state: ProfileCardState;
  requestOpen: (next: boolean) => void;
  setTriggerRef: React.RefCallback<HTMLButtonElement>;
}

export function buildProfileModel(input: ProfileModelInput): ProfileSelectCardModel {
  const { props, items, refs, reactId, state, requestOpen, setTriggerRef } = input;
  const menuId: string = `${reactId}-menu`;
  return {
    interactive: state.interactive,
    menuOpen: state.menuOpen,
    triggerId: props.id ?? reactId,
    menuId,
    ariaExpanded: state.interactive ? state.menuOpen : undefined,
    ariaControls: state.menuOpen ? menuId : undefined,
    ariaDisabled: state.interactive && state.disabled ? true : undefined,
    avatarSrc: resolveAvatarSrc(props.avatarSrc),
    triggerSx: profileTriggerSx(state),
    items,
    ctx: { refs, open: state.menuOpen, requestOpen, onSelect: props.onSelect },
    setTriggerRef,
  };
}
