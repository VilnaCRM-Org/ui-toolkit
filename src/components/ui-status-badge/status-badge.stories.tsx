import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiStatusBadgeProps } from './types';

import UiStatusBadge from './index';

// The two label regimes, side by side (types.ts, a11y contract §5). A WIRED badge
// takes a constant, state-free name — `aria-pressed` already carries the state, so
// a state-describing name would double-signal it. A STATIC badge is a `role="img"`
// whose name is the ENTIRE non-visual signal, so it must name the state it paints.
const TOGGLE_LABEL: string = 'Виконано';
const DONE_LABEL: string = 'Завдання виконано';
const NOT_DONE_LABEL: string = 'Завдання не виконано';

/**
 * The `active` axis is always controlled (S3) — the badge never self-flips it — so
 * a stateful wrapper owns the flag and `onToggle` feeds it back, which is what
 * keeps the story clickable. Unlike the 3.4 radio a toggle fires from BOTH states,
 * so this handler flips rather than latching. Storybook Controls drive the initial
 * value (and every other prop); props are threaded explicitly, since the repo
 * forbids prop-spreading.
 */
function StatusBadgeStory({ args }: Readonly<{ args: UiStatusBadgeProps }>): React.ReactElement {
  const [active, setActive] = React.useState<boolean>(args.active ?? false);
  // Adopt `active` changes from Controls while keeping clicks/keys interactive.
  React.useEffect((): void => {
    setActive(args.active ?? false);
  }, [args.active]);
  const handleToggle = React.useCallback((): void => {
    setActive((previous: boolean): boolean => !previous);
  }, []);
  return (
    <UiStatusBadge
      label={args.label}
      active={active}
      onToggle={handleToggle}
      disabled={args.disabled}
    />
  );
}

const meta: Meta<typeof UiStatusBadge> = {
  title: 'UiComponents/UiStatusBadge',
  component: UiStatusBadge,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Accessible name — constant when wired, state-naming when static'),
    active: booleanControlArgType('Done state (always controlled; exposed as aria-pressed)'),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, activation no-ops'),
  },
};

export default meta;

type Story = StoryObj<typeof UiStatusBadge>;

// Wired render: `onToggle` makes the badge ONE native toggle button carrying
// `aria-pressed`, so hover, activation and the focus ring are all live.
function renderWired(args: UiStatusBadgeProps): React.ReactElement {
  return <StatusBadgeStory args={args} />;
}

// Static render: no `onToggle`, so the badge is content — a `role="img"` with no
// tabindex and no other ARIA — over an identical content tree. `active` IS passed
// here on purpose: unlike the 3.4 static card, a static badge exposes its state
// programmatically through the required name, so static + active is legal
// (Ruling 4) and deliberately does not warn.
function renderStatic(args: UiStatusBadgeProps): React.ReactElement {
  return <UiStatusBadge label={args.label} active={args.active} />;
}

// The primary story: the wired rest state, pixel-for-pixel with the Figma master
// (26x26, white disc, brandGray outline and check).
export const StatusBadge: Story = {
  args: { label: TOGGLE_LABEL },
  render: renderWired,
};

// The pressed badge: a solid success disc with a white check, behind
// `aria-pressed="true"`. Hovering it changes nothing — hover is an intermediate
// tint between rest and active, so it must never demote a done badge.
export const Active: Story = {
  args: { label: TOGGLE_LABEL, active: true },
  render: renderWired,
};

// Disabled wired badge: the aria-disabled boundary — a real, focusable button
// whose hover recipe is suppressed and whose activation no-ops. Figma draws this
// column, and it derives from ACTIVE: a solid fill with a white check, desaturated
// to brandGray. A disabled badge reads "done and frozen", never "empty".
export const Disabled: Story = {
  args: { label: TOGGLE_LABEL, disabled: true },
  render: renderWired,
};

// Static, not done: the name carries the state, because the pale-vs-green
// distinction is colour-only and may never travel alone (SC 1.4.1, SC 1.1.1).
export const Static: Story = {
  args: { label: NOT_DONE_LABEL },
  render: renderStatic,
};

// Static, done: the same tree painting the active chrome, with the state moved
// into the name — the other half of the static label regime.
export const StaticDone: Story = {
  args: { label: DONE_LABEL, active: true },
  render: renderStatic,
};
