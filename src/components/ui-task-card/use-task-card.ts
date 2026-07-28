import { useDevWarning } from '@/utils/dev-warn';

import type { TaskAssignee, UiTaskCardProps } from './types';

const MISSING_AVATAR_WARNING: string =
  'UiTaskCard received an `assignee` without a usable `avatarSrc`; no photo is rendered. ' +
  'Omit `assignee` for an unassigned task, or pass a valid URL or import.';
const BLANK_NAME_WARNING: string =
  'UiTaskCard received an `assignee` with a blank `name`; the photo renders with `alt=""` ' +
  'and drops out of the card name. Pass the assignee name.';

/** The resolved avatar the card paints: a usable URL plus its alt text. */
export interface TaskCardAvatar {
  src: string;
  alt: string;
}

// The view model the card renders from. Keeps the component thin: the wired/static
// split, the aria-disabled boundary and the avatar resolution all live here.
export interface TaskCardModel {
  /** True when `onActivate` is present — the card renders as a native button. */
  interactive: boolean;
  disabled: boolean;
  /** `aria-disabled` for a disabled wired card; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** The photo to paint, or `null` for an unassigned task (track still reserved). */
  avatar: TaskCardAvatar | null;
  /** Fired on activation; a no-op while disabled (`onActivate` never runs then). */
  onActivate: () => void;
}

// Accepts a URL string or a static import (`{ src }`). The optional chain absorbs a
// runtime nullish `avatarSrc`, which the strict prop type forbids but API/CMS data
// does not.
function resolveAvatarUrl(assignee: TaskAssignee): string | undefined {
  const source: TaskAssignee['avatarSrc'] | undefined = assignee.avatarSrc;
  if (typeof source === 'string') {
    return source;
  }
  return source?.src;
}

// A blank name yields `alt=""` rather than a meaningless one: the photo then adds
// nothing to the card's accessible name instead of adding noise.
function resolveAvatar(assignee: TaskAssignee | undefined): TaskCardAvatar | null {
  if (assignee == null) {
    return null;
  }
  const url: string | undefined = resolveAvatarUrl(assignee);
  if (!url) {
    return null;
  }
  return { src: url, alt: assignee.name?.trim() ? assignee.name : '' };
}

// Split from `avatarWarning` to keep both exit counts inside the metrics budget.
function assigneeWarning(assignee: TaskAssignee): string | null {
  if (!resolveAvatarUrl(assignee)) {
    return MISSING_AVATAR_WARNING;
  }
  return assignee.name?.trim() ? null : BLANK_NAME_WARNING;
}

// Dev-only backstop for runtime data the strict types forbid. An omitted assignee
// is a supported state (unassigned task), so it never warns.
function avatarWarning(assignee: TaskAssignee | undefined): string | null {
  if (assignee == null) {
    return null;
  }
  return assigneeWarning(assignee);
}

// Activation gated in the model layer: a disabled card swallows the activation so
// `onActivate` never fires while disabled (a11y contract §1).
function makeActivate(disabled: boolean, onActivate?: () => void): () => void {
  return (): void => {
    if (disabled) return;
    onActivate?.();
  };
}

export function useTaskCard(props: UiTaskCardProps): TaskCardModel {
  useDevWarning(avatarWarning(props.assignee));
  const interactive: boolean = props.onActivate != null;
  const disabled: boolean = props.disabled ?? false;
  return {
    interactive,
    disabled,
    ariaDisabled: interactive && disabled ? true : undefined,
    avatar: resolveAvatar(props.assignee),
    onActivate: makeActivate(disabled, props.onActivate),
  };
}
