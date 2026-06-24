import InputAdornment from '@mui/material/InputAdornment';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { t } from 'i18next';
import React from 'react';
import { useForm, type Control } from 'react-hook-form';

import UiTextFieldForm from '../../../src/components/ui-text-field-form';
import type { CustomTextField } from '../../../src/components/ui-text-field-form/types';

// Integration tier: render UiTextFieldForm with its REAL children — the
// react-hook-form Controller, the real UiInput, and the MUI TextField it wraps
// (adornments included). Nothing here is mocked; every assertion goes through
// the fully composed element to prove the cross-component wiring works.

type FormValues = { fullName: string };

type HostProps = Omit<CustomTextField<FormValues>, 'control' | 'name'> & {
  onSubmit?: (values: FormValues) => void;
  submitLabel?: string;
};

// A minimal real react-hook-form host. `mode: 'onTouched'` mirrors the
// component's Storybook usage so validation fires the way consumers see it. We
// intentionally omit form-level `defaultValues` so the field-level
// `defaultValue` prop the component forwards to its Controller stays effective.
function Host({
  onSubmit = (): void => {},
  submitLabel = 'Submit',
  ...fieldProps
}: HostProps): React.ReactElement {
  const { control, handleSubmit } = useForm<FormValues>({
    mode: 'onTouched',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <UiTextFieldForm<FormValues>
        control={control as Control<FormValues>}
        name="fullName"
        // Host forwards arbitrary field props to the component under test
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...fieldProps}
      />
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

describe('UiTextFieldForm (integration)', () => {
  it('associates a real MUI label with the underlying input', () => {
    render(<Host label="Full name" />);

    // getByLabelText only resolves when the composed TextField wires a real
    // <label htmlFor> to the rendered <input> — proving the association.
    const input: HTMLElement = screen.getByLabelText('Full name');

    expect(input).toBe(screen.getByRole('textbox'));
    expect(input.tagName).toBe('INPUT');
  });

  it('forwards type and placeholder through UiInput to the real TextField', () => {
    render(<Host label="Full name" placeholder="Enter your name" type="text" />);

    const input: HTMLElement = screen.getByRole('textbox');

    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('placeholder', 'Enter your name');
    expect(input).toHaveValue('');
  });

  it('reflects keystrokes typed via user-event into the controlled value', async () => {
    const user: UserEvent = userEvent.setup();
    render(<Host label="Full name" />);

    const input: HTMLElement = screen.getByLabelText('Full name');
    await user.type(input, 'Ada Lovelace');

    expect(input).toHaveValue('Ada Lovelace');
  });

  it('clears the controlled value back to empty through the real binding', async () => {
    const user: UserEvent = userEvent.setup();
    render(<Host label="Full name" defaultValue="Initial" />);

    const input: HTMLElement = screen.getByLabelText('Full name');
    expect(input).toHaveValue('Initial');

    await user.clear(input);

    expect(input).toHaveValue('');
  });

  it('surfaces the rules validation message and aria-invalid after an invalid submit', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <Host label="Full name" rules={{ required: 'This field is required' }} submitLabel="Submit" />
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // The error.message flows Controller -> UiInput.helperText -> TextField,
    // and error={!!error} flips aria-invalid on the real input.
    expect(await screen.findByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears the surfaced error once the field becomes valid again', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <Host
        label="Full name"
        rules={{
          required: 'This field is required',
          minLength: { value: 3, message: 'Name must be at least 3 characters' },
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('This field is required')).toBeInTheDocument();

    const input: HTMLElement = screen.getByLabelText('Full name');
    await user.type(input, 'Grace Hopper');

    await waitFor(() =>
      expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
    );
    expect(input).toHaveValue('Grace Hopper');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('surfaces a length-rule message produced by the real validator', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <Host
        label="Full name"
        rules={{
          minLength: { value: 3, message: 'Name must be at least 3 characters' },
        }}
      />
    );

    const input: HTMLElement = screen.getByLabelText('Full name');
    // 'onTouched' validates after blur — type a too-short value then blur.
    await user.type(input, 'Al');
    await user.tab();

    expect(await screen.findByText('Name must be at least 3 characters')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders helperText when no validation error is present', () => {
    render(<Host label="Full name" helperText="We never share your name" />);

    expect(screen.getByText('We never share your name')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });

  it('lets a validation error message take precedence over static helperText', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <Host
        label="Full name"
        helperText="Static helper copy"
        rules={{ required: 'This field is required' }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('This field is required')).toBeInTheDocument();
    expect(screen.queryByText('Static helper copy')).not.toBeInTheDocument();
  });

  it('renders an end adornment through the composed TextField', () => {
    render(
      <Host
        label="Full name"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <span>units</span>
            </InputAdornment>
          ),
        }}
      />
    );

    // The adornment is merged into the real TextField via slotProps.input and
    // shares the input's accessible group, so it renders alongside the field.
    expect(screen.getByText('units')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('seeds the controlled input from a provided defaultValue', () => {
    render(<Host label="Full name" defaultValue="Seeded name" />);

    expect(screen.getByLabelText('Full name')).toHaveValue('Seeded name');
  });

  it('submits the typed value through the real react-hook-form pipeline', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    render(<Host label="Full name" onSubmit={onSubmit} submitLabel="Submit" />);

    await user.type(screen.getByLabelText('Full name'), 'Katherine Johnson');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ fullName: 'Katherine Johnson' }, expect.anything())
    );
  });

  it('surfaces a globally initialised i18n string as the validation message', async () => {
    const user: UserEvent = userEvent.setup();
    const requiredMessage: string = t('This field is required');
    render(<Host label="Full name" rules={{ required: requiredMessage }} submitLabel="Submit" />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText(requiredMessage)).toBeInTheDocument();
  });
});
