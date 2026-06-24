import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { FieldValues, SubmitHandler, useFormContext } from 'react-hook-form';

import UiForm from '../../../src/components/ui-form';
import UiInput from '../../../src/components/ui-input';
import UiTextFieldForm from '../../../src/components/ui-text-field-form';

// Integration tier: render UiForm with its REAL composed children (UiInput and
// UiTextFieldForm) inside the live react-hook-form context provided by UiForm.
// No child mocks — we assert the wired-together behaviour: typing updates form
// state, submit forwards the entered values to onSubmit, and validation errors
// surface on the real inputs.

type LoginForm = {
  email: string;
  password: string;
};

const DEFAULT_VALUES: LoginForm = { email: '', password: '' };

const EMAIL_LABEL: string = 'Email';
const PASSWORD_LABEL: string = 'Password';
const SUBMIT_LABEL: string = 'Sign in';
const FORM_TITLE: string = 'Account access';

const REQUIRED_EMAIL_MESSAGE: string = 'Email is required';
const INVALID_EMAIL_MESSAGE: string = 'Enter a valid email';
const SHORT_PASSWORD_MESSAGE: string = 'Password must be at least 6 characters';

// Real composed children: both fields read `control` from the live form context
// that UiForm publishes, exactly as a consumer would wire them inside <UiForm>.
function LoginFields(): React.ReactElement {
  const { control } = useFormContext<LoginForm>();

  return (
    <>
      <UiTextFieldForm<LoginForm>
        control={control}
        name="email"
        label={EMAIL_LABEL}
        type="email"
        rules={{
          required: REQUIRED_EMAIL_MESSAGE,
          pattern: {
            value: /^[^@\s]{1,64}@[^@\s]{1,255}\.[^@\s]{1,255}$/,
            message: INVALID_EMAIL_MESSAGE,
          },
        }}
      />
      <UiTextFieldForm<LoginForm>
        control={control}
        name="password"
        label={PASSWORD_LABEL}
        type="password"
        rules={{
          required: 'Password is required',
          minLength: { value: 6, message: SHORT_PASSWORD_MESSAGE },
        }}
      />
    </>
  );
}

type RenderFormOptions = {
  onSubmit: SubmitHandler<LoginForm>;
  resetOnSuccess?: boolean;
};

function renderLoginForm({ onSubmit, resetOnSuccess = false }: RenderFormOptions): void {
  render(
    <UiForm<LoginForm>
      onSubmit={onSubmit}
      defaultValues={DEFAULT_VALUES}
      submitLabel={SUBMIT_LABEL}
      title={FORM_TITLE}
      resetOnSuccess={resetOnSuccess}
    >
      <LoginFields />
    </UiForm>
  );
}

describe('UiForm integration (real composed inputs)', () => {
  it('renders the composed children as accessible fields inside the form', () => {
    renderLoginForm({ onSubmit: jest.fn() });

    expect(screen.getByText(FORM_TITLE)).toBeInTheDocument();
    expect(screen.getByLabelText(EMAIL_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(PASSWORD_LABEL)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: SUBMIT_LABEL })).toBeInTheDocument();
  });

  it('updates form state as the user types into the real inputs', async () => {
    const user: ReturnType<typeof userEvent.setup> = userEvent.setup();
    renderLoginForm({ onSubmit: jest.fn() });

    const emailField: HTMLInputElement = screen.getByLabelText(EMAIL_LABEL) as HTMLInputElement;
    const passwordField: HTMLInputElement = screen.getByLabelText(
      PASSWORD_LABEL
    ) as HTMLInputElement;

    await user.type(emailField, 'ada@example.com');
    await user.type(passwordField, 'sup3rsecret');

    expect(emailField).toHaveValue('ada@example.com');
    expect(passwordField).toHaveValue('sup3rsecret');
  });

  it('calls onSubmit with the values entered into the real inputs', async () => {
    const user: ReturnType<typeof userEvent.setup> = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    renderLoginForm({ onSubmit });

    await user.type(screen.getByLabelText(EMAIL_LABEL), 'grace@example.com');
    await user.type(screen.getByLabelText(PASSWORD_LABEL), 'hopper42');
    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const [submitted] = onSubmit.mock.calls[0] as [LoginForm, unknown];
    expect(submitted).toEqual({ email: 'grace@example.com', password: 'hopper42' });
  });

  it('surfaces required-field errors on the real inputs on an empty submit', async () => {
    const user: ReturnType<typeof userEvent.setup> = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    renderLoginForm({ onSubmit });

    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    expect(await screen.findByText(REQUIRED_EMAIL_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByLabelText(EMAIL_LABEL)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(PASSWORD_LABEL)).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the pattern/length validation messages from the field rules', async () => {
    const user: ReturnType<typeof userEvent.setup> = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    renderLoginForm({ onSubmit });

    await user.type(screen.getByLabelText(EMAIL_LABEL), 'not-an-email');
    await user.type(screen.getByLabelText(PASSWORD_LABEL), 'abc');
    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    expect(await screen.findByText(INVALID_EMAIL_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText(SHORT_PASSWORD_MESSAGE)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears a surfaced error after the user corrects the field (onTouched)', async () => {
    const user: ReturnType<typeof userEvent.setup> = userEvent.setup();
    renderLoginForm({ onSubmit: jest.fn() });

    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }));
    expect(await screen.findByText(REQUIRED_EMAIL_MESSAGE)).toBeInTheDocument();

    await user.type(screen.getByLabelText(EMAIL_LABEL), 'fixed@example.com');

    await waitFor(() => expect(screen.queryByText(REQUIRED_EMAIL_MESSAGE)).not.toBeInTheDocument());
    expect(screen.getByLabelText(EMAIL_LABEL)).toHaveAttribute('aria-invalid', 'false');
  });

  it('blocks submit while a raw UiInput stays invalid, then succeeds when valid', async () => {
    const user: ReturnType<typeof userEvent.setup> = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();

    // A second composition path: a raw UiInput registered straight into the form
    // context via register(), with the error state read back from formState —
    // proving the bridge exposes register/formState/handleSubmit to arbitrary
    // real children, not only UiTextFieldForm.
    type RawForm = { username: string };
    function RawRegisteredField(): React.ReactElement {
      const {
        register,
        formState: { errors },
      } = useFormContext<RawForm>();
      return (
        <UiInput
          label="Username"
          error={!!errors.username}
          {...register('username', { required: true })}
        />
      );
    }

    render(
      <UiForm<RawForm>
        onSubmit={onSubmit as SubmitHandler<RawForm>}
        defaultValues={{ username: '' }}
        submitLabel={SUBMIT_LABEL}
        title="Raw field form"
      >
        <RawRegisteredField />
      </UiForm>
    );

    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }));
    await waitFor(() =>
      expect(screen.getByLabelText('Username')).toHaveAttribute('aria-invalid', 'true')
    );
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Username'), 'turing');
    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const [submitted] = onSubmit.mock.calls[0] as [FieldValues, unknown];
    expect(submitted).toEqual({ username: 'turing' });
  });

  it('resets the real inputs to defaults after a successful submit (resetOnSuccess)', async () => {
    const user: ReturnType<typeof userEvent.setup> = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    renderLoginForm({ onSubmit, resetOnSuccess: true });

    await user.type(screen.getByLabelText(EMAIL_LABEL), 'reset@example.com');
    await user.type(screen.getByLabelText(PASSWORD_LABEL), 'resetme');
    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByLabelText(EMAIL_LABEL)).toHaveValue(''));
    expect(screen.getByLabelText(PASSWORD_LABEL)).toHaveValue('');
  });
});

describe('UiForm header and error composition', () => {
  const noop: SubmitHandler<LoginForm> = (): void => {};

  it('surfaces a form-level error in an alert region', () => {
    render(
      <UiForm<LoginForm>
        onSubmit={noop}
        defaultValues={DEFAULT_VALUES}
        submitLabel={SUBMIT_LABEL}
        title={FORM_TITLE}
        error="Service unavailable"
      >
        <LoginFields />
      </UiForm>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable');
  });

  it('hides the title when showTitle is false', () => {
    render(
      <UiForm<LoginForm>
        onSubmit={noop}
        defaultValues={DEFAULT_VALUES}
        submitLabel={SUBMIT_LABEL}
        title={FORM_TITLE}
        showTitle={false}
      >
        <LoginFields />
      </UiForm>
    );

    expect(screen.queryByText(FORM_TITLE)).not.toBeInTheDocument();
  });

  it('renders the subtitle when showSubtitle is enabled', () => {
    render(
      <UiForm<LoginForm>
        onSubmit={noop}
        defaultValues={DEFAULT_VALUES}
        submitLabel={SUBMIT_LABEL}
        title={FORM_TITLE}
        subtitle="Sign in to continue"
        showSubtitle
      >
        <LoginFields />
      </UiForm>
    );

    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
  });
});

describe('UiForm submitting state', () => {
  const noopSubmit: SubmitHandler<LoginForm> = (): void => {};

  it('honours an explicit isSubmitting flag on the submit control', () => {
    render(
      <UiForm<LoginForm>
        onSubmit={noopSubmit}
        defaultValues={DEFAULT_VALUES}
        submitLabel={SUBMIT_LABEL}
        title={FORM_TITLE}
        isSubmitting
      >
        <LoginFields />
      </UiForm>
    );

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

describe('UiTextFieldForm consumer-handler composition (real form context)', () => {
  // The other tests render fields WITHOUT consumer onChange/onBlur, so they only
  // exercise the nullish side of inputProps.onChange?.()/onBlur?.(). This test
  // passes both handlers to prove RHF's own change/blur AND the consumer's run —
  // covering the truthy branch the composition added.
  it('runs the consumer onChange and onBlur alongside RHF without dropping either', async () => {
    const user: ReturnType<typeof userEvent.setup> = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    const onBlur: jest.Mock = jest.fn();

    function FieldWithConsumerHandlers(): React.ReactElement {
      const { control } = useFormContext<LoginForm>();

      return (
        <UiTextFieldForm<LoginForm>
          control={control}
          name="email"
          label={EMAIL_LABEL}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    }

    render(
      <UiForm<LoginForm>
        onSubmit={jest.fn()}
        defaultValues={DEFAULT_VALUES}
        submitLabel={SUBMIT_LABEL}
        title={FORM_TITLE}
      >
        <FieldWithConsumerHandlers />
      </UiForm>
    );

    const emailField: HTMLInputElement = screen.getByLabelText(EMAIL_LABEL) as HTMLInputElement;
    await user.type(emailField, 'lovelace@example.com');
    await user.tab();

    // RHF still tracked the value (its onChange ran)…
    expect(emailField).toHaveValue('lovelace@example.com');
    // …and the consumer's own handlers fired too.
    expect(onChange).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
