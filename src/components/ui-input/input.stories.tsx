import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';
import { expect, fn, userEvent, within } from 'storybook/test';

import UiInput from './index';

const typedFieldLabel: string = t('Full name');
const typedText: string = 'Ada Lovelace';

const meta: Meta<typeof UiInput> = {
  title: 'UiComponents/UiInput',
  component: UiInput,
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      type: 'string',
      description: 'Placeholder text for the input',
      control: { type: 'text' },
    },
    value: {
      type: 'string',
      description: 'Value of the input element',
      control: { type: 'text' },
    },
    disabled: {
      type: 'boolean',
      description: 'Whether the input is disabled',
      control: { type: 'boolean' },
    },
    type: {
      type: 'string',
      description: 'Type of the input element (e.g., text, password)',
      options: ['text', 'password', 'email', 'number'],
      control: { type: 'radio' },
    },
    error: {
      type: 'boolean',
      description: 'Whether the input is in error state',
      control: { type: 'boolean' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiInput>;

export const Input: Story = {
  args: {
    placeholder: t('Input'),
    error: false,
  },
};

// Interaction story (`interaction` tag): proves typing reaches the underlying
// input, updates its value and reports every keystroke through `onChange`.
// `onChange` is an explicit `fn()` spy — an implicit action arg throws when it is
// invoked from a play function. See tests/storybook/README.md.
export const TypingUpdatesValue: Story = {
  tags: ['interaction', '!autodocs'],
  args: {
    label: typedFieldLabel,
    error: false,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }): Promise<void> => {
    const field: HTMLElement = within(canvasElement).getByRole('textbox', {
      name: typedFieldLabel,
    });

    await userEvent.type(field, typedText);

    await expect(field).toHaveValue(typedText);
    await expect(args.onChange).toHaveBeenCalledTimes(typedText.length);
  },
};
