import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';
import { expect, fn, userEvent, within } from 'storybook/test';

import UiCheckbox from './index';

const toggleLabel: string = t('Send me product updates');
const rememberLabel: string = t('Remember me');

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

export const Checked: Story = {
  args: {
    checked: true,
    label: rememberLabel,
  },
};

export const CompactMobileSize: Story = {
  args: {
    checked: true,
    label: rememberLabel,
    sx: { '& .MuiCheckbox-root .ui-checkbox-box': { width: '1.25rem', height: '1.25rem' } },
  },
};

export const KeyboardFocusReachesCheckedBox: Story = {
  tags: ['interaction', '!autodocs'],
  args: {
    checked: true,
    label: rememberLabel,
    onChange: fn(),
  },
  play: async ({ canvasElement }): Promise<void> => {
    const input: HTMLElement = within(canvasElement).getByRole('checkbox', { name: rememberLabel });
    const box: Element = canvasElement.querySelector('.ui-checkbox-box--checked') as Element;

    await expect(getComputedStyle(box).backgroundImage).toMatch(/^url\("data:image\/svg\+xml,/);
    await expect(getComputedStyle(box).backgroundColor).toBe('rgb(30, 174, 255)');

    await userEvent.tab();

    await expect(input).toHaveFocus();
    await expect(input).toBeChecked();
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
