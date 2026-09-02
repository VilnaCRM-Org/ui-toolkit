import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  selectControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiChevronButtonProps } from './types';

import UiChevronButton from './index';

// Icon-only, so this is the button's whole accessible name.
const CHEVRON_LABEL: string = 'Наступна сторінка';

// The story fires no real side effect; the callback exists only to WIRE the
// button, because interactivity is switched on callback presence alone.
function noop(): void {
  return undefined;
}

const meta: Meta<typeof UiChevronButton> = {
  title: 'UiComponents/UiChevronButton',
  component: UiChevronButton,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Accessible name (aria-label) — the only name channel'),
    direction: selectControlArgType('Which way the glyph points; purely visual', ['left', 'right']),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, activation no-ops'),
  },
};

export default meta;

type Story = StoryObj<typeof UiChevronButton>;

// Wired render: `onActivate` turns the circle into ONE native button, so hover,
// `:active`, the focus ring and Enter/Space are all live.
function renderWired(args: UiChevronButtonProps): React.ReactElement {
  return (
    <UiChevronButton
      label={args.label}
      direction={args.direction}
      disabled={args.disabled}
      onActivate={noop}
    />
  );
}

export const ChevronButton: Story = {
  args: { label: CHEVRON_LABEL, direction: 'right' },
  render: renderWired,
};
