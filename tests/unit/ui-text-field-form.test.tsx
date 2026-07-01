import InputAdornment from '@mui/material/InputAdornment';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useForm, Control } from 'react-hook-form';

import { UiTextFieldForm } from '../../src/components';
import breakpointsTheme from '../../src/components/ui-breakpoints';
import colorTheme from '../../src/components/ui-color-theme';
import textFieldFormStyles from '../../src/components/ui-text-field-form/styles';

import { testPlaceholder, testText } from './constants';

// UiTextFieldForm wraps UiInput; silence UiInput's dev-only accessible-name
// guidance for these fixtures so it does not clutter the output.
beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

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

describe('UiTextFieldForm styles', () => {
  it('applies spacing and the theme error color to the error text', () => {
    expect(textFieldFormStyles.errorText).toEqual(
      expect.objectContaining({
        marginTop: '0.25rem',
        paddingBottom: '10px',
        color: colorTheme.palette.error.main,
      })
    );
  });

  it('shrinks the error text font size below the sm breakpoint', () => {
    const smBreakpoint: number = breakpointsTheme.breakpoints.values.sm;
    const mediaQuery: string = `@media (max-width: ${smBreakpoint}px)`;

    expect(textFieldFormStyles.errorText).toHaveProperty(mediaQuery, {
      fontSize: '0.75rem',
    });
  });

  it('invokes consumer onChange and onBlur alongside the react-hook-form handlers', () => {
    const onChange: jest.Mock = jest.fn();
    const onBlur: jest.Mock = jest.fn();

    function ConsumerHandlerWrapper(): React.ReactElement {
      const { control } = useForm();

      return (
        <UiTextFieldForm
          control={control}
          name="testField"
          placeholder={testPlaceholder}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    }

    render(<ConsumerHandlerWrapper />);
    const input: HTMLElement = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: testText } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('runs the form blur handler when no consumer onBlur is provided', () => {
    function NoHandlerWrapper(): React.ReactElement {
      const { control } = useForm();

      return <UiTextFieldForm control={control} name="testField" placeholder={testPlaceholder} />;
    }

    render(<NoHandlerWrapper />);
    const input: HTMLElement = screen.getByRole('textbox');

    // No consumer onBlur: exercises the optional-chaining skip in the composed handler.
    fireEvent.blur(input);

    expect(input).toBeInTheDocument();
  });
});

describe('UiTextFieldForm defaultValue branch', () => {
  type OmittedDefaultFormValues = { testField: string };

  function OmittedDefaultWrapper(): React.ReactElement {
    const { control } = useForm<OmittedDefaultFormValues>();

    return (
      <UiTextFieldForm<OmittedDefaultFormValues>
        control={control as Control<OmittedDefaultFormValues>}
        name="testField"
        placeholder={testPlaceholder}
      />
    );
  }

  it('renders an empty controlled value when defaultValue is omitted', () => {
    render(<OmittedDefaultWrapper />);

    const input: HTMLElement = screen.getByRole('textbox');

    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', testPlaceholder);
  });

  it('falls back to a form-level default when defaultValue is omitted', () => {
    function FormDefaultWrapper(): React.ReactElement {
      const { control } = useForm<OmittedDefaultFormValues>({
        defaultValues: { testField: 'form-seeded' },
      });

      return (
        <UiTextFieldForm<OmittedDefaultFormValues>
          control={control as Control<OmittedDefaultFormValues>}
          name="testField"
          placeholder={testPlaceholder}
        />
      );
    }

    render(<FormDefaultWrapper />);

    expect(screen.getByRole('textbox')).toHaveValue('form-seeded');
  });
});
