import InputAdornment from '@mui/material/InputAdornment';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useForm } from 'react-hook-form';

import { UiTextFieldForm } from '../../src/components';

import { testPlaceholder, testText } from './constants';

describe('UiTextFieldForm', () => {
  function TestWrapper(): React.ReactElement {
    const { control, handleSubmit } = useForm();
    const onSubmit: () => void = jest.fn();

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <UiTextFieldForm
          control={control}
          name="testField"
          rules={{
            required: 'This field is required',
            minLength: {
              value: 5,
              message: 'Must be at least 5 characters',
            },
          }}
          placeholder={testPlaceholder}
          type="text"
          fullWidth
        />
        <button type="submit">Submit</button>
      </form>
    );
  }

  it('renders the UiInput component with the correct props', () => {
    render(<TestWrapper />);

    const uiInput: HTMLElement = screen.getByRole('textbox');

    expect(uiInput).toHaveAttribute('type', 'text');
    expect(uiInput).toHaveAttribute('placeholder', testPlaceholder);
    expect(uiInput).toHaveValue('');
    expect(uiInput).not.toHaveAttribute('error');
  });

  it('updates the form field value on input change', () => {
    render(<TestWrapper />);

    const uiInput: HTMLElement = screen.getByRole('textbox');

    fireEvent.change(uiInput, { target: { value: testText } });

    expect(uiInput).toHaveValue(testText);
  });

  it('renders validation state and error text after an invalid submit', async () => {
    render(<TestWrapper />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards supported input props to UiInput', () => {
    function DisabledFieldWrapper(): React.ReactElement {
      const { control } = useForm();

      return (
        <UiTextFieldForm
          control={control}
          name="testField"
          placeholder={testPlaceholder}
          id="disabled-field"
          disabled
        />
      );
    }

    render(<DisabledFieldWrapper />);

    const uiInput: HTMLElement = screen.getByRole('textbox');

    expect(uiInput).toHaveAttribute('id', 'disabled-field');
    expect(uiInput).toBeDisabled();
  });

  it('renders helperText when there is no validation error', () => {
    function HelperTextWrapper(): React.ReactElement {
      const { control } = useForm();

      return (
        <UiTextFieldForm
          control={control}
          name="testField"
          placeholder={testPlaceholder}
          helperText="Helpful copy"
        />
      );
    }

    render(<HelperTextWrapper />);

    expect(screen.getByText('Helpful copy')).toBeInTheDocument();
  });

  it('uses defaultValue when provided', () => {
    function DefaultValueWrapper(): React.ReactElement {
      const { control } = useForm();

      return (
        <UiTextFieldForm
          control={control}
          name="testField"
          placeholder={testPlaceholder}
          defaultValue={testText}
        />
      );
    }

    render(<DefaultValueWrapper />);

    expect(screen.getByRole('textbox')).toHaveValue(testText);
  });

  it('forwards InputProps to the underlying text field', () => {
    function InputPropsWrapper(): React.ReactElement {
      const { control } = useForm();

      return (
        <UiTextFieldForm
          control={control}
          name="testField"
          placeholder={testPlaceholder}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" data-testid="field-adornment">
                km
              </InputAdornment>
            ),
          }}
        />
      );
    }

    render(<InputPropsWrapper />);

    expect(screen.getByTestId('field-adornment')).toBeInTheDocument();
  });
});
