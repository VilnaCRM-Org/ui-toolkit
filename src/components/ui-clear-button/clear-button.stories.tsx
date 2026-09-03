import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiClearButtonProps } from './types';

import UiClearButton, { DEFAULT_LABEL } from './index';

const meta: Meta<typeof UiClearButton> = {
  title: 'UiComponents/UiClearButton',
  component: UiClearButton,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType(`Visible label; defaults to "${DEFAULT_LABEL}"`),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, activation no-ops'),
    lang: textControlArgType('Only when the label differs from the page language'),
  },
};

export default meta;

type Story = StoryObj<typeof UiClearButton>;

// A stable no-op so the story never passes a fresh inline arrow into props.
function noop(): void {
  return undefined;
}

// Wired render: `onActivate` turns the row into ONE native button, so hover,
// `:active` and the focus ring are all live.
function renderWired(args: UiClearButtonProps): React.ReactElement {
  return (
    <UiClearButton label={args.label} disabled={args.disabled} lang={args.lang} onActivate={noop} />
  );
}

// Static render: no `onActivate`, so the button is plain content — no role, no
// tabindex, no ARIA of any kind — over an identical content tree.
function renderStatic(args: UiClearButtonProps): React.ReactElement {
  return <UiClearButton label={args.label} lang={args.lang} />;
}

// The primary story: the wired rest state, pixel-for-pixel with the Figma
// Board A "clear" master.
export const ClearButton: Story = {
  args: {},
  render: renderWired,
};

// The aria-disabled boundary: a real, focusable button whose activation no-ops.
// Figma ships a disabled column, so it IS painted — label and glyph both swap to
// grey300.
export const Disabled: Story = {
  args: { disabled: true },
  render: renderWired,
};

export const Static: Story = {
  args: {},
  render: renderStatic,
};
