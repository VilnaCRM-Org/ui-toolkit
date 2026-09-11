import type { ProfileSelectItem, UiProfileSelectCardProps } from './types';

const UNWIRED_WARNING: string =
  'UiProfileSelectCard received `open` or `onSelect` without `onOpenChange`; the card is ' +
  'static content, so the menu never renders and these are ignored.';
const DISABLED_OPEN_WARNING: string =
  'UiProfileSelectCard received `open` together with `disabled`; `disabled` wins and the ' +
  'closed card is rendered. No `onOpenChange(false)` is emitted — close it yourself.';
const EMPTY_ITEMS_WARNING: string =
  'UiProfileSelectCard was opened with an empty `items` array; no menu is rendered, because ' +
  'an empty `role="menu"` is an accessibility defect. Pass at least one item.';
const BLANK_NAME_WARNING: string =
  'UiProfileSelectCard received a blank `name`; the trigger would have no accessible name ' +
  '(the avatar is decorative). Pass the person name.';
const DUPLICATE_ID_WARNING: string =
  'UiProfileSelectCard received duplicate item `id`s; `onSelect` cannot attribute an action ' +
  'and React keys collide. Make every `id` unique.';

/** The props the §12 warnings inspect, with `items` already normalised. */
export interface ProfileWarningInput {
  props: UiProfileSelectCardProps;
  items: ProfileSelectItem[];
}

function itemIdOf(item: ProfileSelectItem): string {
  return item.id;
}

function hasDuplicateIds(items: ProfileSelectItem[]): boolean {
  return new Set(items.map(itemIdOf)).size !== items.length;
}

// The wired/static switch is `onOpenChange` alone, so anything that only makes
// sense on a wired card is a misconfiguration without it (a11y contract §3.3).
function unwiredWarning(input: ProfileWarningInput): string | null {
  if (input.props.onOpenChange != null) {
    return null;
  }
  const wiredOnly: boolean = input.props.open !== undefined || input.props.onSelect != null;
  return wiredOnly ? UNWIRED_WARNING : null;
}

// The two states where the component deliberately renders something other than
// what `open` asks for (§6.3 disabled dominance, §3.4 empty menu).
function stateWarning(input: ProfileWarningInput): string | null {
  const open: boolean = input.props.open ?? false;
  if (open && (input.props.disabled ?? false)) {
    return DISABLED_OPEN_WARNING;
  }
  if (open && input.props.onOpenChange != null && input.items.length === 0) {
    return EMPTY_ITEMS_WARNING;
  }
  return null;
}

// Dev-only backstop for runtime data the strict prop types forbid but CMS/API
// payloads produce anyway.
function contentWarning(input: ProfileWarningInput): string | null {
  if (!input.props.name?.trim()) {
    return BLANK_NAME_WARNING;
  }
  return hasDuplicateIds(input.items) ? DUPLICATE_ID_WARNING : null;
}

/** The first applicable a11y-contract §12 warning, or null when all is well. */
export function profileSelectWarning(input: ProfileWarningInput): string | null {
  return unwiredWarning(input) ?? stateWarning(input) ?? contentWarning(input);
}
