import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';

import UiButton from './index';

const meta: Meta<typeof UiButton> = {
  title: 'UiComponents/UiButton',
  component: UiButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      type: 'string',
      description: 'Variant of the button',
      options: ['contained', 'outlined'],
      control: { type: 'radio' },
    },
    size: {
      type: 'string',
      description: 'Size of the button',
      options: ['small', 'medium'],
      control: { type: 'radio' },
    },
    children: {
      type: 'string',
      name: 'label',
      description: 'Text of the button',
    },
    type: {
      type: 'string',
      description: 'Type of the button',
      options: ['button', 'submit'],
      control: { type: 'radio' },
    },
    disabled: {
      type: 'boolean',
      description: 'Whether the button is disabled',
      control: { type: 'boolean' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiButton>;

export const Contained: Story = {
  args: {
    children: t('header.actions.try_it_out'),
    variant: 'contained',
    size: 'small',
  },
};
export const Outlined: Story = {
  args: {
    children: t('header.actions.log_in'),
    variant: 'outlined',
    size: 'small',
  },
};

export const SocialButton: Story = {
  args: {
    children: t('Social Button'),
    variant: 'outlined',
    size: 'medium',
    name: 'socialButton',
  },
};

export const Danger: Story = {
  args: {
    children: t('Cancel'),
    variant: 'contained',
    size: 'small',
    name: 'danger',
  },
};

// `loading` is rendered as `aria-disabled` plus a guarded activation path, never
// MUI's native-disabled loading branch: a focused element that becomes disabled
// drops focus to `<body>`, losing a keyboard user's place the moment their own
// click starts the fetch. The label keeps its ink transparent (not hidden), so
// the button keeps its width and its accessible name.
export const Loading: Story = {
  args: {
    children: t('header.actions.try_it_out'),
    variant: 'contained',
    size: 'small',
    loading: true,
  },
};
