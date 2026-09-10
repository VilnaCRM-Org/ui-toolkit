import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { BellGlyph } from './bell-glyph';
import { COUNT_CLASS, countChipSx, notificationBadgeSx } from './styles';
import type { UiNotificationBadgeProps } from './types';
import { useNotificationBadge, type NotificationBadgeModel } from './use-notification-badge';

interface BadgeContentProps {
  count: number;
  display: string;
}

// The visible content shared by the wired (button) and static shells — ONE DOM
// tree, identical reading order (S2). The counter span is `aria-hidden` because
// its text is already duplicated into the button's accessible name, and at
// `count === 0` it is not rendered at all: an empty chip would paint a state the
// name deliberately omits. No live region of any kind lives here, in any state
// (S9) — see `types.ts` for why that boundary belongs to the consumer.
function BadgeContent({ count, display }: Readonly<BadgeContentProps>): React.ReactElement {
  return (
    <>
      <BellGlyph />
      {count > 0 ? (
        <Box component="span" aria-hidden="true" className={COUNT_CLASS} sx={countChipSx}>
          {display}
        </Box>
      ) : null}
    </>
  );
}

interface BadgeShellProps {
  badge: UiNotificationBadgeProps;
  model: NotificationBadgeModel;
  sx: SxProps<Theme>;
}

interface WiredBadgeProps extends BadgeShellProps {
  forwardedRef: React.ForwardedRef<HTMLButtonElement>;
}

// The wired badge is ONE native `<button type="button">` covering the whole 48px
// circle (the `type` is mandatory — an untyped button submits an enclosing form).
// Its accessible name is the `aria-label` composed in the model, built from the
// DISPLAY string so the visible "9+" is contained in it (WCAG 2.5.3). No key
// handlers: the native button already fires on Enter and Space, and a manual
// handler would double-fire on Space. The popup attributes appear only when the
// consumer declares one, with `aria-controls` dropped while the menu is closed. A
// disabled badge keeps the aria-disabled boundary — still a real, focusable button
// whose activation no-ops in the model — so keyboard focus is never dropped when a
// focused badge flips disabled.
function WiredBadge({
  badge,
  model,
  sx,
  forwardedRef,
}: Readonly<WiredBadgeProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      id={badge.id}
      aria-label={model.name}
      aria-haspopup={model.ariaHasPopup}
      aria-expanded={model.ariaExpanded}
      aria-controls={model.ariaControls}
      aria-disabled={model.ariaDisabled}
      onClick={model.onActivate}
      ref={forwardedRef}
      sx={sx}
    >
      <BadgeContent count={model.count} display={model.display} />
    </Box>
  );
}

// The unwired badge: static, non-interactive decoration — no role, no tabindex and
// no ARIA of any kind, not even `aria-disabled` (S2). The content tree is identical
// to the wired branch, and no `aria-label` is invented for it: a static badge is
// not a control, so the surrounding content owns whatever the count needs to say.
function StaticBadge({ badge, model, sx }: Readonly<BadgeShellProps>): React.ReactElement {
  return (
    <Box component="div" id={badge.id} sx={sx}>
      <BadgeContent count={model.count} display={model.display} />
    </Box>
  );
}

// The notification bell (Figma Board A, node 451:26194): a 48px circular button
// with an overhanging counter chip. Passing `onActivate` turns it into a single
// native button that requests the consumer's notification surface; without it the
// badge is static decoration. The forwarded ref lands on that button — never on a
// wrapper — so a consumer can return focus to the bell after their panel closes.
// The badge itself NEVER moves focus, NEVER opens anything and NEVER changes the
// count: all three belong to the consumer. See `types.ts` for the full contract,
// including the standing prohibition on live regions.
const UiNotificationBadge: React.ForwardRefExoticComponent<
  UiNotificationBadgeProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, UiNotificationBadgeProps>(
  (props: Readonly<UiNotificationBadgeProps>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const model: NotificationBadgeModel = useNotificationBadge(props);
    const sx: SxProps<Theme> = notificationBadgeSx({
      interactive: model.interactive,
      sx: props.sx,
    });
    if (model.interactive) {
      return <WiredBadge badge={props} model={model} sx={sx} forwardedRef={ref} />;
    }
    return <StaticBadge badge={props} model={model} sx={sx} />;
  }
);

UiNotificationBadge.displayName = 'UiNotificationBadge';

export default UiNotificationBadge;
