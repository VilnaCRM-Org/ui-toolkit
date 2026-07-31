import { useDevWarning } from '@/utils/dev-warn';

import notificationBadgeWarning from './notification-badge-warnings';
import { resolveCount, type NotificationCount } from './notification-count';
import { notificationName } from './notification-name';
import type { UiNotificationBadgeProps } from './types';

/** The optional menu-button passthrough; every field is absent unless wired. */
export interface PopupAttributes {
  /** `aria-haspopup`, only when the consumer declares a popup. */
  ariaHasPopup: 'menu' | undefined;
  /** `aria-expanded`, present in BOTH states once a popup is declared. */
  ariaExpanded: boolean | undefined;
  /** `aria-controls` only while the menu is mounted — never a dangling idref. */
  ariaControls: string | undefined;
}

// The view model the badge renders from. It keeps the component thin: the
// wired/static split, the count normalisation, the name composition, the
// `aria-disabled` boundary and the popup passthrough all live here.
export interface NotificationBadgeModel extends PopupAttributes {
  /** True when `onActivate` is present — the badge renders as a button. */
  interactive: boolean;
  /** Normalised count; `0` renders no chip at all (a11y contract §6). */
  count: number;
  /** The chip's text, and the same string the accessible name carries. */
  display: string;
  /** The button's `aria-label`; a static badge never renders it. */
  name: string;
  /** `aria-disabled` for a disabled wired badge; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** Fired on activation; a no-op while disabled (the S4 boundary). */
  onActivate: () => void;
}

// Activation is gated in the model layer, before the callback is reached: a
// disabled badge swallows it so `onActivate` never fires, which is what lets the
// button stay focusable and keeps focus from being dropped (WCAG 2.4.3).
function makeActivate(disabled: boolean, onActivate?: () => void): () => void {
  return (): void => {
    if (disabled) {
      return;
    }
    onActivate?.();
  };
}

// `hasPopup` is the switch for the whole channel: with it, `aria-expanded` is
// emitted in both states (coerced from nullish, S3) so the button never looks
// stateless to assistive tech; without it, none of the three attributes appear.
// `aria-controls` is additionally gated on the menu actually being open.
function popupAttributes(
  props: Readonly<UiNotificationBadgeProps>,
  interactive: boolean
): PopupAttributes {
  const wired: boolean = interactive && props.hasPopup != null;
  return {
    ariaHasPopup: wired ? props.hasPopup : undefined,
    ariaExpanded: wired ? (props.menuOpen ?? false) : undefined,
    ariaControls: wired && props.menuOpen === true ? props.menuId : undefined,
  };
}

export function useNotificationBadge(
  props: Readonly<UiNotificationBadgeProps>
): NotificationBadgeModel {
  useDevWarning(notificationBadgeWarning(props));
  const interactive: boolean = props.onActivate != null;
  const disabled: boolean = props.disabled ?? false;
  const counter: NotificationCount = resolveCount({ count: props.count, max: props.max });
  const name: string = notificationName({
    label: props.label,
    count: counter.count,
    display: counter.display,
  });
  return {
    interactive,
    count: counter.count,
    display: counter.display,
    name,
    ariaDisabled: interactive && disabled ? true : undefined,
    onActivate: makeActivate(disabled, props.onActivate),
    ...popupAttributes(props, interactive),
  };
}
