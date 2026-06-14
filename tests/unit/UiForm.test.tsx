import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { UiForm } from '../../src/components';

type FormValues = {
  email: string;
};

function RegisteredField(): React.ReactElement {
  const { register } = useFormContext<FormValues>();

  return (
    // register() returns native input props; spreading is idiomatic react-hook-form
    // eslint-disable-next-line react/jsx-props-no-spreading
    <input aria-label="Email" {...register('email')} />
  );
}

describe('UiForm', () => {
  it('submits registered field values', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();

    render(
      <UiForm<FormValues>
        onSubmit={onSubmit}
        defaultValues={{ email: '' }}
        submitLabel="Submit"
        title="Sign in"
      >
        <RegisteredField />
      </UiForm>
    );

    await user.type(screen.getByLabelText('Email'), 'person@example.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ email: 'person@example.com' }, expect.anything())
    );
  });

  it('renders the optional error banner', () => {
    render(
      <UiForm<FormValues>
        onSubmit={jest.fn()}
        defaultValues={{ email: '' }}
        submitLabel="Submit"
        title="Sign in"
        error="Request failed"
      >
        <RegisteredField />
      </UiForm>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Request failed');
  });

  it('resets to default values after a successful submit when requested', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn().mockResolvedValue(undefined);

    render(
      <UiForm<FormValues>
        onSubmit={onSubmit}
        defaultValues={{ email: 'reset@example.com' }}
        submitLabel="Submit"
        title="Sign in"
        resetOnSuccess
      >
        <RegisteredField />
      </UiForm>
    );

    const input: HTMLElement = screen.getByLabelText('Email');
    await user.clear(input);
    await user.type(input, 'changed@example.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByLabelText('Email')).toHaveValue('reset@example.com'));
  });

  it('renders the title and subtitle headings when both are shown', () => {
    render(
      <UiForm<FormValues>
        onSubmit={jest.fn()}
        defaultValues={{ email: '' }}
        submitLabel="Submit"
        title="Sign in"
        subtitle="Use your work email"
      >
        <RegisteredField />
      </UiForm>
    );

    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Use your work email')).toBeInTheDocument();
  });

  it('omits the title and subtitle when both are hidden', () => {
    render(
      <UiForm<FormValues>
        onSubmit={jest.fn()}
        defaultValues={{ email: '' }}
        submitLabel="Submit"
        title="Sign in"
        subtitle="Use your work email"
        showTitle={false}
        showSubtitle={false}
      >
        <RegisteredField />
      </UiForm>
    );

    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
    expect(screen.queryByText('Use your work email')).not.toBeInTheDocument();
  });

  it('shows the loader and disables submit while submitting is forced on', () => {
    render(
      <UiForm<FormValues>
        onSubmit={jest.fn()}
        defaultValues={{ email: '' }}
        submitLabel="Submit"
        title="Sign in"
        isSubmitting
      >
        <RegisteredField />
      </UiForm>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('disables submit when isSubmitDisabled is set without a loader', () => {
    render(
      <UiForm<FormValues>
        onSubmit={jest.fn()}
        defaultValues={{ email: '' }}
        submitLabel="Submit"
        title="Sign in"
        isSubmitDisabled
      >
        <RegisteredField />
      </UiForm>
    );

    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
