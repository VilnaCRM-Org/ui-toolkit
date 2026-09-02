import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiAddButtonProps } from './types';
import { DEFAULT_LABEL } from './use-add-button';

import UiAddButton from './index';

// Storybook wiring only — the story has no board state to add a column to.
function handleActivate(): void {
  // Intentionally empty: the story merely exercises the visible chrome.
}

// Wired render: `onActivate` turns the whole pill into ONE native button, so
// hover, `:active`, the focus ring and Enter/Space are all live.
function renderWired(args: UiAddButtonProps): React.ReactElement {
  return (
    <UiAddButton
      label={args.label}
      disabled={args.disabled}
      lang={args.lang}
      onActivate={handleActivate}
    />
  );
}

const meta: Meta<typeof UiAddButton> = {
  title: 'UiComponents/UiAddButton',
  component: UiAddButton,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Visible label, also the accessible name'),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, activation no-ops'),
    lang: textControlArgType('Only when the label differs from the page language'),
  },
};

export default meta;

type Story = StoryObj<typeof UiAddButton>;

// The primary story: the wired rest state, pixel-for-pixel with the Figma
// "plus" chip button master (the built-in Ukrainian default label).
export const AddButton: Story = {
  args: { label: DEFAULT_LABEL },
  render: renderWired,
};
