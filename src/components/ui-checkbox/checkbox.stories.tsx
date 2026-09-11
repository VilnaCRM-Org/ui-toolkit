import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';
import { expect, fn, userEvent, within } from 'storybook/test';

import UiCheckbox from './index';

const toggleLabel: string = t('Send me product updates');

const meta: Meta<typeof UiCheckbox> = {
  title: 'UiComponents/UiCheckbox',
  component: UiCheckbox,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      type: 'boolean',
      description: 'Whether the checkbox is disabled',
      control: { type: 'boolean' },
    },
    label: {
      type: 'string',
      description: 'Label for the checkbox',
    },
    onChange: {
      type: 'function',
      description: 'Callback function when the checkbox is changed',
    },
    error: {
      type: 'boolean',
      description: 'Whether the checkbox is in error state',
      control: { type: 'boolean' },
    },
    required: {
      type: 'boolean',
      description: 'Marks the checkbox as required for assistive technology',
      control: { type: 'boolean' },
    },
    helperText: {
      type: 'string',
      description: 'Description linked via aria-describedby (e.g. the reason it is invalid)',
      control: { type: 'text' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiCheckbox>;

export const Checkbox: Story = {
  args: {
    error: false,
    label: t('Checkbox label text'),
  },
};

// Interaction story (`interaction` tag): proves a click flips the checked state
// and reports it through `onChange`. See tests/storybook/README.md.
export const ClickTogglesCheckedState: Story = {
  tags: ['interaction', '!autodocs'],
  args: {
    error: false,
    label: toggleLabel,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }): Promise<void> => {
    const box: HTMLElement = within(canvasElement).getByRole('checkbox', { name: toggleLabel });

    await expect(box).not.toBeChecked();

    await userEvent.click(box);

    await expect(box).toBeChecked();
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};
