import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { CheckGlyph } from './check-glyph';
import { BADGE_ROOT_CLASS, statusBadgeSx } from './styles';
import type { UiStatusBadgeProps } from './types';
import { useStatusBadge, type StatusBadgeModel } from './use-status-badge';

interface ToggleBadgeProps {
  badge: UiStatusBadgeProps;
  model: StatusBadgeModel;
  sx: SxProps<Theme>;
  badgeRef: React.ForwardedRef<HTMLButtonElement>;
}

interface ImageBadgeProps {
  badge: UiStatusBadgeProps;
  sx: SxProps<Theme>;
}

// The wired badge is ONE native `<button type="button">` (the `type` is mandatory
// — an untyped button submits the enclosing form) carrying `aria-pressed`.
// `role="switch"` and `aria-checked` are forbidden: this is a toggle, not a
// switch and not a radio. The name is a constant `aria-label` — the badge is
// icon-only, so there is no visible text to derive it from, and the label must
// NOT bake the state in, because `aria-pressed` already announces it. No key
// handlers: the native button already fires on Enter and Space, and a manual
// handler would double-fire on Space. A disabled badge keeps the `aria-disabled`
// boundary — still a real, focusable button whose activation no-ops in the model
// — so keyboard focus is never dropped when a focused badge flips disabled. The
// 26px box is the whole hit area (>=24px, SC 2.5.8) and must not be shrunk.
function ToggleBadge({
  badge,
  model,
  sx,
  badgeRef,
}: Readonly<ToggleBadgeProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      id={badge.id}
      className={BADGE_ROOT_CLASS}
      aria-label={badge.label}
      aria-pressed={model.ariaPressed}
      aria-disabled={model.ariaDisabled}
      onClick={model.onActivate}
      ref={badgeRef}
      sx={sx}
    >
      <CheckGlyph />
    </Box>
  );
}

// The unwired badge: content, not a control. `role="img"` is its CONTENT
// semantics rather than interactivity, which is the single exception to the
// "static branch renders no role" rule — and it is load-bearing, because that
// role's name is the only channel through which a colour-only badge tells a
// non-sighted user whether the task is done. Hence no `tabindex`, no
// `aria-pressed`, no `aria-disabled` and nothing else; `disabled` is inert here.
// Both branches render an identical content tree.
function ImageBadge({ badge, sx }: Readonly<ImageBadgeProps>): React.ReactElement {
  return (
    <Box
      component="span"
      role="img"
      id={badge.id}
      className={BADGE_ROOT_CLASS}
      aria-label={badge.label}
      sx={sx}
    >
      <CheckGlyph />
    </Box>
  );
}

// One check-circle status badge (Figma Board A row y=1790). Passing `onToggle`
// turns it into a native toggle button with `aria-pressed`; without it the badge
// is a static `role="img"` whose required `label` names the state it paints. The
// forwarded ref lands on that button — the static branch has no control to hand
// out — so a consumer can return focus to the badge after a dialog closes. The
// badge itself NEVER moves focus and NEVER flips `active`: both belong to the
// consumer. See `types.ts` for the full prop contract, including the two label
// regimes and why an unwired `active` deliberately does not warn.
const UiStatusBadge: React.ForwardRefExoticComponent<
  UiStatusBadgeProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, UiStatusBadgeProps>(
  (props: Readonly<UiStatusBadgeProps>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const model: StatusBadgeModel = useStatusBadge(props);
    const sx: SxProps<Theme> = statusBadgeSx({
      interactive: model.interactive,
      active: model.active,
      sx: props.sx,
    });
    if (model.interactive) {
      return <ToggleBadge badge={props} model={model} sx={sx} badgeRef={ref} />;
    }
    return <ImageBadge badge={props} sx={sx} />;
  }
);

UiStatusBadge.displayName = 'UiStatusBadge';

export default UiStatusBadge;
