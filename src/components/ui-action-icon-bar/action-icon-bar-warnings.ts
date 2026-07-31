import type { UiActionIconBarAction, UiActionIconBarProps } from './types';
import { isWiredAction } from './use-action-state';

const BLANK_ACTION_LABEL_WARNING: string =
  'UiActionIconBar received an action with a blank `label`; icon-only buttons have no visible ' +
  'text, so `aria-label` is their ONLY accessible name. Pass a label for every action.';
const BLANK_BAR_LABEL_WARNING: string =
  'UiActionIconBar received a blank `label` while at least one action is wired; the ' +
  '`role="group"` root would have no accessible name. Pass a label describing the row.';
const IGNORED_PRESSED_WARNING: string =
  'UiActionIconBar received `pressed` on an action without `onToggle`; the action is not a ' +
  'toggle, so `pressed` is IGNORED and no `aria-pressed` is rendered — a pressed-looking glyph ' +
  'with nothing behind it is an accessibility defect. Pass `onToggle` to wire the toggle.';
const DANGLING_MENU_ID_WARNING: string =
  'UiActionIconBar received `menuId` on an action with no `menuOpen`; `aria-controls` is ' +
  'rendered only while the menu is open, so the wiring is ambiguous. Pass `menuOpen` too.';

function hasBlankLabel(action: UiActionIconBarAction): boolean {
  return !action.label?.trim();
}

// `pressed` is honoured only on a real toggle, so supplying it anywhere else is a
// misconfiguration: the glyph swap and `aria-pressed` both hang off `onToggle`.
function hasIgnoredPressed(action: UiActionIconBarAction): boolean {
  return action.pressed != null && action.onToggle == null;
}

// `menuId` alone can never be rendered: `aria-controls` appears only while
// `menuOpen` is true, so without `menuOpen` the consumer has wired half a menu.
function hasDanglingMenuId(action: UiActionIconBarAction): boolean {
  return action.menuId != null && action.menuOpen == null;
}

function actionLabelWarning(actions: readonly UiActionIconBarAction[]): string | null {
  return actions.some(hasBlankLabel) ? BLANK_ACTION_LABEL_WARNING : null;
}

// The group role and its name exist only on a wired bar (S2), so a blank bar
// label matters only once at least one action carries a callback.
function barLabelWarning(
  props: UiActionIconBarProps,
  actions: readonly UiActionIconBarAction[]
): string | null {
  if (!actions.some(isWiredAction)) {
    return null;
  }
  return props.label?.trim() ? null : BLANK_BAR_LABEL_WARNING;
}

function pressedWarning(actions: readonly UiActionIconBarAction[]): string | null {
  return actions.some(hasIgnoredPressed) ? IGNORED_PRESSED_WARNING : null;
}

function popupWarning(actions: readonly UiActionIconBarAction[]): string | null {
  return actions.some(hasDanglingMenuId) ? DANGLING_MENU_ID_WARNING : null;
}

/** The first applicable accessibility-contract warning, or null when all is well. */
export default function actionIconBarWarning(props: UiActionIconBarProps): string | null {
  const actions: readonly UiActionIconBarAction[] = props.actions ?? [];
  return (
    actionLabelWarning(actions) ??
    barLabelWarning(props, actions) ??
    pressedWarning(actions) ??
    popupWarning(actions)
  );
}
