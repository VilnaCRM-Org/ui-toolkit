import { useDevWarning } from '@/utils/dev-warn';

import type { UiItemRowProps } from './types';

// The disclosure view model the row renders from. Keeps the component thin and
// the aria wiring in one place: a wired row is a button with aria-expanded (and
// aria-controls only while expanded); a muted wired row follows the repo
// aria-disabled boundary pattern (still focusable, activation no-ops here).
export interface ItemRowModel {
  /** True when `onToggle` is present — the row renders as a native button. */
  interactive: boolean;
  muted: boolean;
  expanded: boolean;
  /** `aria-expanded` for a wired row; `undefined` (absent) for a static row. */
  ariaExpanded: boolean | undefined;
  /** `aria-controls` only while wired AND expanded AND a `panelId` was given. */
  ariaControls: string | undefined;
  /** `aria-disabled` for a muted wired row; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** Fired on activation; a no-op while muted (onToggle never runs muted). */
  onActivate: () => void;
}

// Dev-only guidance (a11y contract §1.5): `expanded`/`panelId` describe a
// disclosure, so passing either without `onToggle` is a misconfigured row.
function toggleWarning(props: UiItemRowProps): string | null {
  const disclosureProps: boolean = props.expanded !== undefined || props.panelId !== undefined;
  if (disclosureProps && props.onToggle == null) {
    return (
      'UiItemRow: `expanded`/`panelId` were passed without `onToggle`; ' +
      'the row is not a disclosure and these are ignored.'
    );
  }
  return null;
}

// Activation gated in the model layer: a muted row swallows the toggle so
// `onToggle` never fires while muted (a11y contract §4.2).
function makeActivate(muted: boolean, onToggle: UiItemRowProps['onToggle']): () => void {
  return (): void => {
    if (muted) return;
    onToggle?.();
  };
}

export function useItemRow(props: UiItemRowProps): ItemRowModel {
  useDevWarning(toggleWarning(props));
  const interactive: boolean = props.onToggle != null;
  const muted: boolean = props.muted ?? false;
  const expanded: boolean = props.expanded ?? false;
  return {
    interactive,
    muted,
    expanded,
    ariaExpanded: interactive ? expanded : undefined,
    ariaControls: interactive && expanded && props.panelId ? props.panelId : undefined,
    ariaDisabled: interactive && muted ? true : undefined,
    onActivate: makeActivate(muted, props.onToggle),
  };
}
