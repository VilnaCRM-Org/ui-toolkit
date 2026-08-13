import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { UiForm } from '../../src/components';

import mockConsoleWarn from './utils/mock-console-warn';

type FormValues = {
  email: string;
};

type FormCase = {
  onSubmit: jest.Mock;
  onSubmitError?: jest.Mock;
  resetOnSuccess?: boolean;
};

const defaultEmail: string = 'default@example.com';
const typedEmail: string = 'typed@example.com';
const unhandledSubmitRejectionWarning: string =
  'UiForm caught a rejected onSubmit; pass onSubmitError to handle it.';

// UiForm warns through devWarn when a rejection arrives with no onSubmitError
// attached; silence it for the file and assert on the spy where it matters.
const warn = mockConsoleWarn();

function RegisteredField(): React.ReactElement {
  const { register } = useFormContext<FormValues>();

  return (
    // register() returns native input props; spreading is idiomatic react-hook-form
    // eslint-disable-next-line react/jsx-props-no-spreading
    <input aria-label="Email" {...register('email')} />
  );
}

function renderForm({ onSubmit, onSubmitError, resetOnSuccess = false }: FormCase): void {
  render(
    <UiForm<FormValues>
      onSubmit={onSubmit}
      onSubmitError={onSubmitError}
      defaultValues={{ email: defaultEmail }}
      submitLabel="Submit"
      title="Sign in"
      resetOnSuccess={resetOnSuccess}
    >
      <RegisteredField />
    </UiForm>
  );
}

async function typeAndSubmit(user: UserEvent): Promise<void> {
  const input: HTMLElement = screen.getByLabelText('Email');

  await user.clear(input);
  await user.type(input, typedEmail);
  await user.click(screen.getByRole('button', { name: 'Submit' }));
}

// Node emits 'unhandledRejection' once the microtask queue has drained, so wait
// a full timer turn before asserting the listener stayed silent.
async function flushPendingRejections(): Promise<void> {
  await new Promise<void>((resolve): void => {
    setTimeout(resolve, 0);
  });
}

describe('UiForm submit rejections', () => {
  const rejections: unknown[] = [];
  const listener: (reason: unknown) => void = (reason: unknown): void => {
    rejections.push(reason);
  };

  beforeEach((): void => {
    rejections.length = 0;
    process.on('unhandledRejection', listener);
  });

  afterEach((): void => {
    process.off('unhandledRejection', listener);
  });

  it('contains a rejected onSubmit so no unhandled rejection escapes', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn().mockRejectedValue(new Error('Network down'));
    const onSubmitError: jest.Mock = jest.fn();

    renderForm({ onSubmit, onSubmitError });
    await typeAndSubmit(user);

    await waitFor((): void => expect(onSubmit).toHaveBeenCalledTimes(1));
    await flushPendingRejections();

    expect(rejections).toHaveLength(0);
  });

  it('forwards the exact rejection value to onSubmitError exactly once', async () => {
    const user: UserEvent = userEvent.setup();
    const failure: Error = new Error('Network down');
    const onSubmit: jest.Mock = jest.fn().mockRejectedValue(failure);
    const onSubmitError: jest.Mock = jest.fn();

    renderForm({ onSubmit, onSubmitError });
    await typeAndSubmit(user);

    await waitFor((): void => expect(onSubmitError).toHaveBeenCalledTimes(1));
    expect(onSubmitError).toHaveBeenCalledWith(failure);
  });

  it('skips the resetOnSuccess reset after a failed submit', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn().mockRejectedValue(new Error('Network down'));
    const onSubmitError: jest.Mock = jest.fn();

    renderForm({ onSubmit, onSubmitError, resetOnSuccess: true });
    await typeAndSubmit(user);

    await waitFor((): void => expect(onSubmitError).toHaveBeenCalledTimes(1));
    await flushPendingRejections();

    expect(screen.getByLabelText('Email')).toHaveValue(typedEmail);
  });

  it('still resets to the default values after a successful submit', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn().mockResolvedValue(undefined);

    renderForm({ onSubmit, resetOnSuccess: true });
    await typeAndSubmit(user);

    await waitFor((): void => expect(onSubmit).toHaveBeenCalledTimes(1));
    await waitFor((): void => expect(screen.getByLabelText('Email')).toHaveValue(defaultEmail));
  });

  it('warns in development when a rejection arrives with no onSubmitError', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn().mockRejectedValue(new Error('Network down'));

    renderForm({ onSubmit });
    await typeAndSubmit(user);

    await waitFor((): void =>
      expect(warn.spy).toHaveBeenCalledWith(unhandledSubmitRejectionWarning)
    );
    expect(warn.spy).toHaveBeenCalledTimes(1);
    await flushPendingRejections();

    expect(rejections).toHaveLength(0);
  });

  it('forwards a non-Error rejection value unchanged', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn().mockRejectedValue('submission refused');
    const onSubmitError: jest.Mock = jest.fn();

    renderForm({ onSubmit, onSubmitError });
    await typeAndSubmit(user);

    await waitFor((): void => expect(onSubmitError).toHaveBeenCalledTimes(1));
    expect(onSubmitError).toHaveBeenCalledWith('submission refused');
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('re-enables the submit control after a contained rejection', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn().mockRejectedValue(new Error('Network down'));
    const onSubmitError: jest.Mock = jest.fn();

    renderForm({ onSubmit, onSubmitError });
    await typeAndSubmit(user);

    await waitFor((): void => expect(onSubmitError).toHaveBeenCalledTimes(1));
    await waitFor((): void => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
