import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import UiTextFieldForm from '../ui-text-field-form';

import UiForm from './index';

type DemoValues = { email: string };

const meta: Meta<typeof UiForm> = {
  title: 'UiComponents/UiForm',
  component: UiForm,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof UiForm>;

function DemoFields(): React.ReactElement {
  const { control } = useFormContext<DemoValues>();

  return (
    <UiTextFieldForm<DemoValues>
      control={control}
      name="email"
      label="Email"
      type="email"
      rules={{ required: 'Email is required' }}
    />
  );
}

function DemoForm({
  error,
  isSubmitting,
  isSubmitDisabled,
}: {
  error?: string | null;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
}): React.ReactElement {
  return (
    <UiForm<DemoValues>
      onSubmit={(): void => {}}
      defaultValues={{ email: '' }}
      submitLabel="Sign in"
      title="Account access"
      error={error}
      isSubmitting={isSubmitting}
      isSubmitDisabled={isSubmitDisabled}
    >
      <DemoFields />
    </UiForm>
  );
}

export const Default: Story = {
  render: (): React.ReactElement => <DemoForm />,
};

export const WithError: Story = {
  render: (): React.ReactElement => <DemoForm error="Invalid email or password" />,
};

export const Submitting: Story = {
  render: (): React.ReactElement => <DemoForm isSubmitting />,
};

export const SubmitDisabled: Story = {
  render: (): React.ReactElement => <DemoForm isSubmitDisabled />,
};
