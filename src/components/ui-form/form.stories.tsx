import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { useFormContext, type SubmitHandler } from 'react-hook-form';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import UiTextFieldForm from '../ui-text-field-form';

import UiForm from './index';

type DemoValues = { email: string };

const emailLabel: string = 'Email';
const submitLabel: string = 'Sign in';
const requiredMessage: string = 'Email is required';
const validEmail: string = 'ada@vilnacrm.com';
const submitSpy: ReturnType<typeof fn> = fn();

function ignoreSubmit(): void {
  // The demo form has no backend; the presentational stories only need a valid
  // submit handler, and the interaction story swaps in a spy.
}

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
      label={emailLabel}
      type="email"
      rules={{ required: requiredMessage }}
    />
  );
}

function DemoForm({
  error,
  isSubmitting,
  isSubmitDisabled,
  onSubmit = ignoreSubmit,
}: {
  error?: string | null;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
  onSubmit?: SubmitHandler<DemoValues>;
}): React.ReactElement {
  return (
    <UiForm<DemoValues>
      onSubmit={onSubmit}
      defaultValues={{ email: '' }}
      submitLabel={submitLabel}
      title="Account access"
      error={error}
      isSubmitting={isSubmitting}
      isSubmitDisabled={isSubmitDisabled}
    >
      <DemoFields />
    </UiForm>
  );
}

function SpyingDemoForm(): React.ReactElement {
  return <DemoForm onSubmit={submitSpy} />;
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

// Interaction story (`interaction` tag): proves the form blocks an empty submit
// with a visible field error and only calls `onSubmit` once the value is valid.
// See tests/storybook/README.md.
export const ValidationBlocksEmptySubmit: Story = {
  tags: ['interaction', '!autodocs'],
  render: SpyingDemoForm,
  play: async ({ canvasElement }): Promise<void> => {
    const canvas: ReturnType<typeof within> = within(canvasElement);
    submitSpy.mockClear();

    await userEvent.click(canvas.getByRole('button', { name: submitLabel }));

    await expect(await canvas.findByText(requiredMessage)).toBeVisible();
    await expect(submitSpy).not.toHaveBeenCalled();

    await userEvent.type(canvas.getByRole('textbox', { name: emailLabel }), validEmail);
    await userEvent.click(canvas.getByRole('button', { name: submitLabel }));

    await waitFor((): Promise<void> => expect(submitSpy).toHaveBeenCalledTimes(1));
  },
};
