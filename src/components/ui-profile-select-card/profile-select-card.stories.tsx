import type { SxProps, Theme } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { PROFILE_AVATAR_SRC, PROFILE_ITEMS } from '@/showcase/new-components-board/fixtures';

import {
  booleanControlArgType,
  objectControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiProfileSelectCardProps } from './types';

import UiProfileSelectCard from './index';

// The canonical sample content of the Figma master, so every story reads as the
// design does: the master's own person, her photo (shared with the showcase board
// through one inlined data URI) and her three commands. The labels are consumer
// data — the component bakes in no natural-language literals (a11y contract §2.2).
const NAME: string = 'Евгения Маслова';

// The card is fluid (`width: 100%`) so a consumer can size it; the Figma master is
// 225px wide, which is what every story renders at.
const CARD_SX: SxProps<Theme> = { width: '225px' };

// Selection is fire-and-forget and the stories demonstrate the card rather than an
// application shell, so the wired stories share this stable no-op.
function noopSelect(): void {}

/**
 * The open axis is always controlled — the consumer owns `open`, the component
 * owns focus (a11y contract §4) — so a stateful wrapper holds the flag and feeds
 * the next one back through `onOpenChange`, keeping the story interactive.
 * Storybook Controls drive the initial state (and every other prop); props are
 * threaded explicitly, since the repo forbids prop-spreading.
 */
function ProfileSelectCardStory({
  args,
}: Readonly<{ args: UiProfileSelectCardProps }>): React.ReactElement {
  const [open, setOpen] = React.useState<boolean>(args.open ?? false);
  // Adopt `open` changes from Controls while keeping clicks/keys interactive.
  React.useEffect((): void => {
    setOpen(args.open ?? false);
  }, [args.open]);
  const handleOpenChange = React.useCallback((next: boolean): void => setOpen(next), []);
  return (
    <UiProfileSelectCard
      name={args.name}
      avatarSrc={args.avatarSrc}
      items={args.items}
      open={open}
      onOpenChange={handleOpenChange}
      onSelect={noopSelect}
      disabled={args.disabled}
      sx={CARD_SX}
    />
  );
}

const meta: Meta<typeof UiProfileSelectCard> = {
  title: 'UiComponents/UiProfileSelectCard',
  component: UiProfileSelectCard,
  tags: ['autodocs'],
  argTypes: {
    name: textControlArgType('Person name — the trigger accessible name, never clamped'),
    items: objectControlArgType('Menu commands: [{ id, label }] — the labels are yours'),
    open: booleanControlArgType('Initial menu state (always controlled; the menu unmounts)'),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, every open no-ops'),
  },
};

export default meta;

type Story = StoryObj<typeof UiProfileSelectCard>;

// Wired render: the interactive menu-button wrapper (Controls stay live).
function renderInteractive(args: UiProfileSelectCardProps): React.ReactElement {
  return <ProfileSelectCardStory args={args} />;
}

// Static render: no `onOpenChange`, so the card is plain content — no button role,
// no tabindex, no ARIA of any kind — over an identical closed-card content tree,
// and the menu never renders. `open`/`onSelect` are withheld on purpose: on an
// unwired card they are a misconfiguration the component dev-warns about (§12).
function renderStatic(args: UiProfileSelectCardProps): React.ReactElement {
  return (
    <UiProfileSelectCard
      name={args.name}
      avatarSrc={args.avatarSrc}
      items={args.items}
      disabled={args.disabled}
      sx={CARD_SX}
    />
  );
}

// The primary story: the wired rest state, pixel-for-pixel with the Figma master.
export const ProfileSelectCard: Story = {
  args: { name: NAME, avatarSrc: PROFILE_AVATAR_SRC, items: PROFILE_ITEMS },
  render: renderInteractive,
};

// Opened menu: three command rows hanging 11px below the trigger. It starts open,
// so focus lands on the first item exactly as it does after a real activation —
// and the trigger keeps its plain rest chrome (Figma draws no open-state accent).
export const Open: Story = {
  args: { name: NAME, avatarSrc: PROFILE_AVATAR_SRC, items: PROFILE_ITEMS, open: true },
  render: renderInteractive,
};

// Disabled wired card: the aria-disabled boundary — a real, focusable button whose
// hover recipe is suppressed and whose every open path no-ops, painted in the
// master's disabled recipe (brand-gray fill, grey name, half-opacity photo).
export const Disabled: Story = {
  args: { name: NAME, avatarSrc: PROFILE_AVATAR_SRC, items: PROFILE_ITEMS, disabled: true },
  render: renderInteractive,
};

export const Static: Story = {
  args: { name: NAME, avatarSrc: PROFILE_AVATAR_SRC, items: PROFILE_ITEMS },
  render: renderStatic,
};
