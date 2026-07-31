import type { UiActionIconBarAction } from './types';

/** Popup wiring for a consumer-owned menu; the bar itself owns no menu. */
interface PopupAria {
  ariaHasPopup: 'menu' | undefined;
  ariaExpanded: boolean | undefined;
  ariaControls: string | undefined;
}

/** Everything one action slot renders from — derived, never stored. */
export interface ActionState extends PopupAria {
  /** True when the action carries a callback; drives the wired/static split (S2). */
  interactive: boolean;
  /** Coerced toggle state; also the eye/eye-off glyph switch. */
  pressed: boolean;
  /** `aria-pressed`, present in BOTH states on a toggle and absent otherwise. */
  ariaPressed: boolean | undefined;
  /** `aria-disabled` for a disabled wired action; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** Fires the action's own callback; a no-op while disabled (the S4 boundary). */
  onActivate: () => void;
}

export interface ActionStateConfig {
  action: UiActionIconBarAction;
  barDisabled: boolean;
}

/** Interactivity is callback presence alone (S2) — never a role or a flag. */
export function isWiredAction(action: UiActionIconBarAction): boolean {
  return action.onToggle != null || action.onActivate != null;
}

// `aria-controls` is rendered ONLY while the menu is open, so a closed action
// never points at an element that is not in the DOM (the Story 3.3 dangling-idref
// rule). `aria-expanded` is rendered in BOTH states, because an absent
// `aria-expanded` and a `false` one are different announcements.
function popupAria(action: UiActionIconBarAction): PopupAria {
  return {
    ariaHasPopup: action.hasPopup,
    ariaExpanded: action.menuOpen,
    ariaControls: action.menuOpen === true ? action.menuId : undefined,
  };
}

// Activation is gated in the model layer, before anything else: a disabled
// action swallows it so no callback ever fires (the `aria-disabled` boundary,
// S4), which is what lets the button stay real and focusable. A toggle has ONE
// activation path, so `onToggle` wins over a stray `onActivate` and exactly one
// callback fires per click, Enter or Space.
function makeActivate(config: Readonly<ActionStateConfig>): () => void {
  const action: UiActionIconBarAction = config.action;
  return (): void => {
    if (config.barDisabled || action.disabled === true) return;
    (action.onToggle ?? action.onActivate)?.();
  };
}

/**
 * The per-action view model. Called from `ActionButton`'s own body — one
 * component instance per action — so it stays a legal hook call even though the
 * bar renders a variable-length list.
 *
 * `pressed` is ALWAYS controlled and coerced from nullish (S3), and honoured
 * only on a real toggle: `pressed` on a non-toggle action is ignored (and
 * dev-warned) rather than silently painting a state no `aria-pressed` backs.
 */
export function useActionState(config: Readonly<ActionStateConfig>): ActionState {
  const action: UiActionIconBarAction = config.action;
  const toggle: boolean = action.onToggle != null;
  const interactive: boolean = isWiredAction(action);
  const disabled: boolean = config.barDisabled || (action.disabled ?? false);
  const pressed: boolean = toggle && (action.pressed ?? false);
  return {
    interactive,
    pressed,
    ariaPressed: toggle ? pressed : undefined,
    ariaDisabled: interactive && disabled ? true : undefined,
    onActivate: makeActivate(config),
    ...popupAria(action),
  };
}
