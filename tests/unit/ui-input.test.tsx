import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { UiInput } from '../../src/components';

import { testText, testEmail, testPlaceholder } from './constants';

const testType: string = 'email';

describe('UiInput', () => {
  it('renders the input with the provided props', () => {
    render(<UiInput placeholder={testPlaceholder} type={testType} value={testEmail} />);
    const inputElement: HTMLElement = screen.getByPlaceholderText(testPlaceholder);
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', testType);
    expect(inputElement).toHaveValue(testEmail);
  });

  it('calls the onChange function when the input value changes', () => {
    const mockOnChange: () => void = jest.fn();
    render(<UiInput onChange={mockOnChange} />);
    const inputElement: HTMLElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: testText } });
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls the onBlur function when the input loses focus', () => {
    const mockOnBlur: () => void = jest.fn();
    render(<UiInput onBlur={mockOnBlur} />);
    const inputElement: HTMLElement = screen.getByRole('textbox');
    fireEvent.blur(inputElement);
    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('calls the onInput function when the input value changes', () => {
    const mockOnInput: React.FormEventHandler<HTMLDivElement> = jest.fn();
    render(<UiInput onInput={mockOnInput} />);
    const inputElement: HTMLElement = screen.getByRole('textbox');

    fireEvent.input(inputElement, { target: { value: testText } });

    expect(mockOnInput).toHaveBeenCalledTimes(1);
    expect(inputElement).toHaveValue(testText);
  });

  it('applies the correct styles based on the error prop', () => {
    const { rerender } = render(<UiInput error={false} />);
    let inputElement: HTMLElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('aria-invalid', 'false');

    rerender(<UiInput error />);
    inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables the input when the disabled prop is true', () => {
    render(<UiInput disabled />);
    const inputElement: HTMLElement = screen.getByRole('textbox');
    expect(inputElement).toBeDisabled();
  });

  it('should be a non-empty string', () => {
    expect(UiInput.displayName).toBe('UiInput');
  });

  it('does not wrap slotProps when InputProps is omitted', () => {
    render(<UiInput slotProps={{ input: { 'aria-label': 'plain-input' } }} />);
    const inputElement: HTMLElement = screen.getByRole('textbox');
    expect(inputElement).toHaveAttribute('aria-label', 'plain-input');
  });

  it('merges InputProps onto the input slot when no slotProps are given', () => {
    render(<UiInput InputProps={{ readOnly: true, inputProps: { maxLength: 5 } }} />);
    const inputElement: HTMLElement = screen.getByRole('textbox');
    expect(inputElement).toHaveAttribute('readonly');
    expect(inputElement).toHaveAttribute('maxlength', '5');
  });

  it('calls a function slotProps.input with owner state and merges InputProps over it', () => {
    const slotInputFn: jest.Mock = jest.fn(() => ({
      'aria-label': 'from-fn',
      'aria-describedby': 'fn-desc',
    }));
    render(
      <UiInput
        InputProps={{ 'aria-label': 'from-input-props' } as never}
        slotProps={{ input: slotInputFn }}
      />
    );
    const inputElement: HTMLElement = screen.getByRole('textbox');

    expect(slotInputFn).toHaveBeenCalledTimes(1);
    expect(slotInputFn.mock.calls[0][0]).toBeDefined();
    expect(inputElement).toHaveAttribute('aria-describedby', 'fn-desc');
    expect(inputElement).toHaveAttribute('aria-label', 'from-input-props');
  });

  it('merges InputProps over an object slotProps.input base', () => {
    render(
      <UiInput
        InputProps={{ 'aria-label': 'input-props-wins' } as never}
        slotProps={{ input: { 'aria-label': 'object-base', 'aria-describedby': 'obj-desc' } }}
      />
    );
    const inputElement: HTMLElement = screen.getByRole('textbox');

    expect(inputElement).toHaveAttribute('aria-describedby', 'obj-desc');
    expect(inputElement).toHaveAttribute('aria-label', 'input-props-wins');
  });
});
