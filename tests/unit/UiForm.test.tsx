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

  return <input aria-label="Email" {...register('email')} />;
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
});
