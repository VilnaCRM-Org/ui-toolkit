import { Stack } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';
import { useForm } from 'react-hook-form';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import UiButton from '../ui-button';

import type { CustomTextField } from './types';

import UiTextFieldForm from './index';

const meta: Meta<typeof UiTextFieldForm> = {
  title: 'UiComponents/UiTextFieldForm',
  component: UiTextFieldForm,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: ['text', 'email', 'password'],
      defaultValue: 'text',
    },
    rules: {
      control: { type: 'object' },
      defaultValue: {
        required: 'This field is required',
      },
    },
    placeholder: {
      control: { type: 'text' },
      defaultValue: 'Enter text...',
    },
    fullWidth: {
      control: { type: 'boolean' },
      defaultValue: false,
    },
  },
};

export default meta;

type TextFieldFormStoryArgs = Omit<CustomTextField<{ FullName: string }>, 'control' | 'name'>;
type Story = StoryObj<typeof UiTextFieldForm> & {
  args: TextFieldFormStoryArgs;
};

function TextFieldFormStory(args: TextFieldFormStoryArgs): React.ReactElement {
  const { handleSubmit, control } = useForm<{ FullName: string }>({
    mode: 'onTouched',
  });

  const { rules, placeholder, type, fullWidth } = args;

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: '1rem' }}>
        <UiTextFieldForm
          control={control}
          rules={rules}
          placeholder={placeholder}
          type={type}
          name="FullName"
          fullWidth={fullWidth}
        />
        <UiButton size="small" variant="contained" type="submit">
          {t('Submit')}
        </UiButton>
      </Stack>
    </form>
  );
}

const submitLabel: string = t('Submit');
const tooShortMessage: string = t('Name must be at least 3 characters');

const textFieldFormArgs: Story['args'] = {
  rules: {
    required: t('This field is required'),
    validate: (value: string) => {
      if (value.length < 3) {
        return tooShortMessage;
      }
      return true;
    },
  },
  type: 'text',
  placeholder: t('Enter text...'),
  fullWidth: false,
};

export const TextFieldForm: Story = {
  // Storybook's render passes the story args through to the wrapper component.
  // eslint-disable-next-line react/jsx-props-no-spreading
  render: args => <TextFieldFormStory {...(args as TextFieldFormStoryArgs)} />,
  args: textFieldFormArgs,
};

// Interaction story (`interaction` tag): proves the field surfaces its validation
// message on submit and clears it once the value becomes valid.
// See tests/storybook/README.md.
export const ValidationSurfacesFieldError: Story = {
  tags: ['interaction', '!autodocs'],
  // eslint-disable-next-line react/jsx-props-no-spreading
  render: args => <TextFieldFormStory {...(args as TextFieldFormStoryArgs)} />,
  args: textFieldFormArgs,
  play: async ({ canvasElement }): Promise<void> => {
    const canvas: ReturnType<typeof within> = within(canvasElement);
    const field: HTMLElement = canvas.getByRole('textbox');

    await userEvent.type(field, 'ab');
    await userEvent.click(canvas.getByRole('button', { name: submitLabel }));

    await expect(await canvas.findByText(tooShortMessage)).toBeVisible();

    await userEvent.type(field, 'c');

    await waitFor((): Promise<void> => expect(canvas.queryByText(tooShortMessage)).toBeNull());
  },
};
