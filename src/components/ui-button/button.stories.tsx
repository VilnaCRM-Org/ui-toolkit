import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';
import { expect, fn, userEvent, within } from 'storybook/test';

import UiButton from './index';

const clickableLabel: string = t('header.actions.try_it_out');

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

// Interaction story (`interaction` tag): proves the demoed button actually
// dispatches `onClick` in a real browser. See tests/storybook/README.md.
export const ClickInvokesHandler: Story = {
  tags: ['interaction', '!autodocs'],
  args: {
    children: clickableLabel,
    variant: 'contained',
    size: 'small',
    onClick: fn(),
  },
  play: async ({ args, canvasElement }): Promise<void> => {
    const button: HTMLElement = within(canvasElement).getByRole('button', {
      name: clickableLabel,
    });

    await userEvent.click(button);

    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
