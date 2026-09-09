import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { BAR_ACTIONS, type ActionSample } from '@/showcase/new-components-board/fixtures';

import {
  booleanControlArgType,
  objectControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiActionIconBarAction, UiActionIconBarProps } from './types';

import UiActionIconBar from './index';

// The bar carries no visible text, so this is its whole accessible name — and
// unlike the 3.4 radiogroup, the group role and the name are the bar's own.
const BAR_LABEL: string = 'Дії над рядком';

// The consumer-owned menu the popup story points `aria-controls` at, emitted only
// while that menu is really mounted (the Story 3.3 dangling-idref rule).
const MENU_ID: string = 'action-icon-bar-row-menu';

// No real side effects: the callbacks exist to WIRE the actions, because
// interactivity is switched on callback presence alone (a11y contract S2).
function noop(): void {
  return undefined;
}

// The showcase fixtures are plain `{ icon, label }` pairs — already a legal
// UNWIRED action, so the static story consumes them exactly as they are.
const STATIC_ACTIONS: readonly UiActionIconBarAction[] = BAR_ACTIONS;

// The eye is the row's one toggle, so it takes `pressed`/`onToggle` instead of
// `onActivate`; every other slot is a plain command. Its label stays CONSTANT
// across both states — `aria-pressed` already carries the state.
function toWiredAction(sample: ActionSample): UiActionIconBarAction {
  if (sample.icon === 'eye') {
    return { icon: sample.icon, label: sample.label, pressed: false, onToggle: noop };
  }
  return { icon: sample.icon, label: sample.label, onActivate: noop };
}

const WIRED_ACTIONS: readonly UiActionIconBarAction[] = BAR_ACTIONS.map(toWiredAction);

interface EyeToggleConfig {
  actions: readonly UiActionIconBarAction[];
  pressed: boolean;
  onToggle: () => void;
}

// Re-points the eye at the story's own state; every other action passes through
// untouched, so the row keeps its Figma order and its tab order.
function withEyeToggle(config: Readonly<EyeToggleConfig>): readonly UiActionIconBarAction[] {
  return config.actions.map((action: UiActionIconBarAction): UiActionIconBarAction => {
    if (action.icon !== 'eye') {
      return action;
    }
    return { icon: 'eye', label: action.label, pressed: config.pressed, onToggle: config.onToggle };
  });
}

function eyePressedOf(actions: readonly UiActionIconBarAction[]): boolean {
  const eye: UiActionIconBarAction | undefined = actions.find(
    (action: UiActionIconBarAction): boolean => action.icon === 'eye'
  );
  return eye?.pressed ?? false;
}

function togglePressed(previous: boolean): boolean {
  return !previous;
}

const PRESSED_ACTIONS: readonly UiActionIconBarAction[] = withEyeToggle({
  actions: WIRED_ACTIONS,
  pressed: true,
  onToggle: noop,
});

const [, MORE, ROW_MENU] = BAR_ACTIONS;

// The two dots actions, the only ones the contract grants a popup passthrough.
// `aria-expanded` is rendered in BOTH states; `aria-controls` only while open.
const MENU_ACTIONS: readonly UiActionIconBarAction[] = [
  {
    icon: 'dots-horizontal',
    label: MORE.label,
    hasPopup: 'menu',
    menuOpen: true,
    menuId: MENU_ID,
    onActivate: noop,
  },
  {
    icon: 'dots-vertical',
    label: ROW_MENU.label,
    hasPopup: 'menu',
    menuOpen: false,
    onActivate: noop,
  },
];

// `pressed` is ALWAYS controlled (S3) — the bar never self-flips it — so this
// wrapper owns the eye's flag and `onToggle` feeds it back. Controls drive the
// initial state through the `useEffect` adoption below; props are threaded
// explicitly, since the repo forbids prop-spreading.
function ActionIconBarStory({
  args,
}: Readonly<{ args: UiActionIconBarProps }>): React.ReactElement {
  const [pressed, setPressed] = React.useState<boolean>(eyePressedOf(args.actions));
  // Adopt `pressed` edits from Controls while keeping clicks and keys interactive.
  React.useEffect((): void => {
    setPressed(eyePressedOf(args.actions));
  }, [args.actions]);
  const handleToggle = React.useCallback((): void => setPressed(togglePressed), []);
  const actions: readonly UiActionIconBarAction[] = withEyeToggle({
    actions: args.actions,
    pressed,
    onToggle: handleToggle,
  });
  return (
    <UiActionIconBar
      label={args.label}
      actions={actions}
      disabled={args.disabled}
      id={args.id}
      sx={args.sx}
    />
  );
}

const meta: Meta<typeof UiActionIconBar> = {
  title: 'UiComponents/UiActionIconBar',
  component: UiActionIconBar,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Bar name — aria-label on the role="group" root (never a toolbar)'),
    actions: objectControlArgType('Actions in paint AND tab order: { icon, label, … }'),
    disabled: booleanControlArgType(
      'Bar-wide aria-disabled boundary: focusable, activation no-ops'
    ),
    id: textControlArgType('id for the bar root'),
  },
};

export default meta;

type Story = StoryObj<typeof UiActionIconBar>;

// Wired render: every action is a native `<button type="button">` in the bar's
// own `role="group"`, so hover, press, activation and the ring are all live —
// and each button is an independent tab stop (no roving tabindex).
function renderWired(args: UiActionIconBarProps): React.ReactElement {
  return <ActionIconBarStory args={args} />;
}

// Static render: no callbacks anywhere, so the root is a plain `<div>` with no
// group role and no name, and every slot is a `<span>` with no ARIA at all — over
// an identical content tree (S2). Every Control is still threaded through, so
// `id` lands on the static root and `disabled` is deliberately swallowed by the
// component (a static bar exposes no state it cannot back).
function renderStatic(args: UiActionIconBarProps): React.ReactElement {
  return (
    <UiActionIconBar
      label={args.label}
      actions={args.actions}
      disabled={args.disabled}
      id={args.id}
      sx={args.sx}
    />
  );
}

// The bar owns no menu: the popup ARIA is a passthrough, and the menu itself is
// consumer-owned, which is why the story renders it here beside the bar.
function renderMenu(args: UiActionIconBarProps): React.ReactElement {
  return (
    <Box>
      <ActionIconBarStory args={args} />
      <Box component="ul" role="menu" id={MENU_ID} aria-label={MORE.label}>
        <Box component="li" role="menuitem" tabIndex={-1}>
          Редагувати
        </Box>
        <Box component="li" role="menuitem" tabIndex={-1}>
          Дублювати
        </Box>
      </Box>
    </Box>
  );
}

// The primary story: the wired rest row, pixel-for-pixel with the Figma masters
// (Board A y = 1412-1422) on the 12px modal slot rhythm.
export const ActionIconBar: Story = {
  args: { label: BAR_LABEL, actions: WIRED_ACTIONS },
  render: renderWired,
};

// The eye toggle in its pressed state: `aria-pressed="true"` with the eye-off
// glyph. The label does NOT change — the swap is visual only.
export const EyePressed: Story = {
  args: { label: BAR_LABEL, actions: PRESSED_ACTIONS },
  render: renderWired,
};

// The whole-bar aria-disabled boundary: every action stays a real, focusable
// button in the tab order whose hover recipe is suppressed and whose activation
// no-ops. Figma draws a disabled column, so it is painted (grey400 ink).
export const Disabled: Story = {
  args: { label: BAR_LABEL, actions: WIRED_ACTIONS, disabled: true },
  render: renderWired,
};

// Popup passthrough for the two dots actions, with the consumer's own menu.
export const MenuActions: Story = {
  args: { label: BAR_LABEL, actions: MENU_ACTIONS },
  render: renderMenu,
};

export const Static: Story = {
  args: { label: BAR_LABEL, actions: STATIC_ACTIONS },
  render: renderStatic,
};
