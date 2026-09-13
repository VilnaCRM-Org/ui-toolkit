import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import {
  DEFAULT_LOADING_TEXT,
  LOADING_ANNOUNCE_DELAY_MS,
} from '../../src/components/field-controls/use-loading-announcement';
import UiForm from '../../src/components/ui-form';

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

  it('renders the kit spinner inside a focusable, aria-disabled submit while submitting', () => {
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

    // The busy state is UiButton's contract: `aria-disabled` (never native
    // `disabled`, which would drop a keyboard user's focus) and the shared
    // decorative arc — so there is no accessible progressbar, only the polite
    // status region below.
    const button: HTMLElement = screen.getByRole('button', { name: 'Submit' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeEnabled();
    expect(within(button).getByRole('progressbar', { hidden: true })).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('marks the form busy and announces submittingLabel once the delay elapses', () => {
    jest.useFakeTimers();
    render(
      <UiForm<FormValues>
        onSubmit={jest.fn()}
        defaultValues={{ email: '' }}
        submitLabel="Submit"
        submittingLabel="Signing you in"
        title="Sign in"
        isSubmitting
      >
        <RegisteredField />
      </UiForm>
    );

    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByRole('button', { name: 'Submit' }).closest('form')).toHaveAttribute(
      'aria-busy',
      'true'
    );
    const status: HTMLElement = screen.getByRole('status');
    expect(status).toHaveTextContent('');
    React.act((): void => {
      jest.advanceTimersByTime(LOADING_ANNOUNCE_DELAY_MS);
    });
    expect(status).toHaveTextContent('Signing you in');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    jest.useRealTimers();
  });

  it('falls back to the kit loading copy when no submittingLabel is given', () => {
    jest.useFakeTimers();
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

    React.act((): void => {
      jest.advanceTimersByTime(LOADING_ANNOUNCE_DELAY_MS);
    });
    expect(screen.getByRole('status')).toHaveTextContent(DEFAULT_LOADING_TEXT);
    jest.useRealTimers();
  });

  it('keeps the status region empty while idle', () => {
    render(
      <UiForm<FormValues>
        onSubmit={jest.fn()}
        defaultValues={{ email: '' }}
        submitLabel="Submit"
        title="Sign in"
      >
        <RegisteredField />
      </UiForm>
    );

    expect(screen.getByRole('status')).toHaveTextContent('');
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByRole('button', { name: 'Submit' }).closest('form')).toHaveAttribute(
      'aria-busy',
      'false'
    );
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

    const button: HTMLElement = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeDisabled();
    expect(within(button).queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
  });
});

type ErrorFormProps = { error?: string | null };

function ErrorForm({ error }: ErrorFormProps): React.ReactElement {
  return (
    <UiForm<FormValues>
      onSubmit={jest.fn()}
      defaultValues={{ email: '' }}
      submitLabel="Submit"
      title="Sign in"
      error={error}
    >
      <RegisteredField />
    </UiForm>
  );
}

function banner(): HTMLElement {
  // The focus target is the banner box wrapping the alert, not the alert itself.
  return screen.getByRole('alert').parentElement as HTMLElement;
}

describe('UiForm error banner focus', () => {
  it('leaves focus alone when the form mounts with an error already set', () => {
    render(<ErrorForm error="Stale failure" />);

    expect(banner()).toHaveAttribute('tabindex', '-1');
    expect(banner()).not.toHaveFocus();
  });

  it('moves focus to the banner when a submit failure first sets the error', () => {
    const { rerender } = render(<ErrorForm error={null} />);
    screen.getByRole('textbox', { name: 'Email' }).focus();

    rerender(<ErrorForm error="Invalid email or password" />);

    expect(banner()).toHaveFocus();
  });

  it('refocuses the banner when a later failure replaces the message', () => {
    const { rerender } = render(<ErrorForm error={null} />);
    rerender(<ErrorForm error="First failure" />);
    screen.getByRole('textbox', { name: 'Email' }).focus();

    rerender(<ErrorForm error="Second failure" />);

    expect(banner()).toHaveTextContent('Second failure');
    expect(banner()).toHaveFocus();
  });

  it('refocuses an error that returns after being cleared, even when it repeats the first', () => {
    const { rerender } = render(<ErrorForm error="Same failure" />);
    expect(banner()).not.toHaveFocus();

    rerender(<ErrorForm error={null} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(<ErrorForm error="Same failure" />);

    expect(banner()).toHaveFocus();
  });
});

type MutantFormValues = {
  email: string;
};

function MutantRegisteredField(): React.ReactElement {
  const { register } = useFormContext<MutantFormValues>();

  return (
    // register() returns native input props; spreading is idiomatic react-hook-form
    // eslint-disable-next-line react/jsx-props-no-spreading
    <input aria-label="Email" {...register('email')} />
  );
}

type RequiredFormValues = {
  name: string;
};

function RequiredOnTouchedField(): React.ReactElement {
  const {
    register,
    formState: { errors },
  } = useFormContext<RequiredFormValues>();

  return (
    <>
      {/* register() returns native input props; spreading is idiomatic react-hook-form */}
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <input aria-label="Name" {...register('name', { required: 'Name is required' })} />
      {errors.name ? <span>{String(errors.name.message)}</span> : null}
    </>
  );
}

describe('UiForm (mutation hardening)', () => {
  it('omits the error banner entirely when no error is provided', () => {
    render(
      <UiForm<MutantFormValues>
        onSubmit={jest.fn()}
        defaultValues={{ email: '' }}
        submitLabel="Submit"
        title="Sign in"
      >
        <MutantRegisteredField />
      </UiForm>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('styles the error banner with red text and bottom spacing', () => {
    render(
      <UiForm<MutantFormValues>
        onSubmit={jest.fn()}
        defaultValues={{ email: '' }}
        submitLabel="Submit"
        title="Sign in"
        error="Request failed"
      >
        <MutantRegisteredField />
      </UiForm>
    );

    const banner: HTMLElement = screen.getByRole('alert');
    expect(banner).toHaveTextContent('Request failed');
    expect(banner).toHaveStyle({ color: 'rgb(255, 0, 0)', marginBottom: '1rem' });
  });

  it('seeds the registered field from defaultValues', () => {
    render(
      <UiForm<MutantFormValues>
        onSubmit={jest.fn()}
        defaultValues={{ email: 'preset@example.com' }}
        submitLabel="Submit"
        title="Sign in"
      >
        <MutantRegisteredField />
      </UiForm>
    );

    expect(screen.getByLabelText('Email')).toHaveValue('preset@example.com');
  });

  it('validates on blur (onTouched) before any submit', async () => {
    const user: UserEvent = userEvent.setup();

    render(
      <UiForm<RequiredFormValues>
        onSubmit={jest.fn()}
        defaultValues={{ name: '' }}
        submitLabel="Submit"
        title="Sign in"
      >
        <RequiredOnTouchedField />
      </UiForm>
    );

    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Name'));
    await user.tab();

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });

  it('keeps the entered values after submit when resetOnSuccess is left default', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn().mockResolvedValue(undefined);

    render(
      <UiForm<MutantFormValues>
        onSubmit={onSubmit}
        defaultValues={{ email: 'default@example.com' }}
        submitLabel="Submit"
        title="Sign in"
      >
        <MutantRegisteredField />
      </UiForm>
    );

    const input: HTMLElement = screen.getByLabelText('Email');
    await user.clear(input);
    await user.type(input, 'typed@example.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByLabelText('Email')).toHaveValue('typed@example.com'));
  });
});
