import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import colorTheme from '@/components/ui-color-theme';

import {
  booleanControlArgType,
  numberControlArgType,
  selectControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';
import { srOnlySx } from '../field-controls';

import type { UiNotificationBadgeProps } from './types';

import UiNotificationBadge from './index';

// The active chip ring is cut out of the PAGE background in Figma (#FBFBFB), not
// out of white, so every story sits on that surface — on white the 2px ring reads
// as a halo instead of the gap the master draws. The padding also keeps the 54×50
// active bounds unclipped: the chip overhangs the circle and must never be cropped.
const SURFACE_SX: SxProps<Theme> = {
  display: 'inline-flex',
  padding: '0.75rem',
  backgroundColor: colorTheme.palette.backgroundGrey100.main,
};

// The consumer's popup id. `aria-controls` is emitted only while the panel is
// open, so a closed badge never leaves a dangling idref — but "not dangling"
// also means the target has to EXIST while the badge points at it, which is the
// consumer's half of the contract. The demo therefore mounts a real panel
// alongside the open badge. It is visually hidden rather than painted: the badge
// masters draw no panel, so a visible one would change every baseline while
// teaching nothing about the badge itself.
const MENU_ID: string = 'notification-panel';

// The consumer's half of the `aria-controls` contract, mounted only while open.
function NotificationPanel(): React.ReactElement {
  return <Box component="div" id={MENU_ID} role="menu" aria-label="Сповіщення" sx={srOnlySx} />;
}

/**
 * `menuOpen` is always controlled (S3): the badge never opens anything itself, it
 * only announces the intent through `onActivate`, so the story owns the flag and
 * feeds it back. That same flag paints the Figma "active" column, because a
 * solid-blue bell and an open panel are the same picture. Storybook Controls drive
 * the initial state; props are threaded explicitly, since the repo forbids
 * prop-spreading.
 */
function NotificationBadgeStory({
  args,
}: Readonly<{ args: UiNotificationBadgeProps }>): React.ReactElement {
  const [menuOpen, setMenuOpen] = React.useState<boolean>(args.menuOpen ?? false);
  // Adopt `menuOpen` changes from Controls while keeping clicks/keys interactive.
  React.useEffect((): void => {
    setMenuOpen(args.menuOpen ?? false);
  }, [args.menuOpen]);
  const handleActivate: () => void = React.useCallback((): void => {
    setMenuOpen((open: boolean): boolean => !open);
  }, []);
  return (
    <Box sx={SURFACE_SX}>
      <UiNotificationBadge
        count={args.count}
        label={args.label}
        max={args.max}
        onActivate={handleActivate}
        hasPopup={args.hasPopup}
        menuOpen={menuOpen}
        menuId={MENU_ID}
        disabled={args.disabled}
      />
      {menuOpen ? <NotificationPanel /> : null}
    </Box>
  );
}

const meta: Meta<typeof UiNotificationBadge> = {
  title: 'UiComponents/UiNotificationBadge',
  component: UiNotificationBadge,
  tags: ['autodocs'],
  argTypes: {
    count: numberControlArgType('Unread count — always controlled; 0 renders no chip at all'),
    label: textControlArgType('Name stem; the whole name at 0 and the prefix above it'),
    max: numberControlArgType('Counter cap: above it the chip and the name both read `${max}+`'),
    hasPopup: selectControlArgType('Declares that activation opens a menu', ['menu']),
    menuOpen: booleanControlArgType(
      'Open state → aria-expanded in BOTH states, plus active chrome'
    ),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, activation no-ops'),
  },
};

export default meta;

type Story = StoryObj<typeof UiNotificationBadge>;

// Wired render: `onActivate` makes the whole 48px circle one native button that
// requests the consumer's notification surface, so hover, the pressed/expanded
// chrome and the focus ring are all live.
function renderWired(args: UiNotificationBadgeProps): React.ReactElement {
  return <NotificationBadgeStory args={args} />;
}

// Static render: no `onActivate`, so the badge is plain decoration — no role, no
// tabindex, no ARIA of any kind — over an identical content tree. `label` is
// withheld on purpose: an unwired badge renders no accessible name at all, so the
// surrounding content owns whatever the count needs to say.
function renderStatic(args: UiNotificationBadgeProps): React.ReactElement {
  return (
    <Box sx={SURFACE_SX}>
      <UiNotificationBadge count={args.count} max={args.max} />
    </Box>
  );
}

// The primary story: the wired rest state with one unread notification, named
// "Сповіщення: 1" — the plural-free format (Ruling 5).
export const NotificationBadge: Story = {
  args: { count: 1, hasPopup: 'menu' },
  render: renderWired,
};

// Nothing unread: no chip is rendered at all, and the name collapses to the bare
// label, so it never describes a counter the user cannot see.
export const Empty: Story = {
  args: { count: 0, hasPopup: 'menu' },
  render: renderWired,
};

// Over the cap: chip and accessible name both read "9+" from the SAME display
// string, which is what keeps the visible text contained in the name (SC 2.5.3).
export const Overflow: Story = {
  args: { count: 42, hasPopup: 'menu' },
  render: renderWired,
};

// The Figma "active" column, reached through the consumer's open panel:
// `aria-expanded="true"` paints the solid-blue bell and the chip's 2px outside
// ring, with no extra prop invented for the pressed look.
export const MenuOpen: Story = {
  args: { count: 3, hasPopup: 'menu', menuOpen: true },
  render: renderWired,
};

// Disabled wired badge: the aria-disabled boundary — a real, focusable button
// whose hover and active recipes are suppressed and whose activation no-ops.
export const Disabled: Story = {
  args: { count: 5, hasPopup: 'menu', disabled: true },
  render: renderWired,
};

export const Static: Story = {
  args: { count: 5 },
  render: renderStatic,
};
