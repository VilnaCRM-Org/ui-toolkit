import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { UiCheckbox } from '../../src/components';

import { testText } from './constants';

const mockOnChange: () => void = jest.fn();

describe('UiCheckbox', () => {
  it('renders the checkbox with the provided label', () => {
    render(<UiCheckbox label={testText} onChange={mockOnChange} />);
    const checkboxLabel: HTMLElement = screen.getByLabelText(testText);
    expect(checkboxLabel).toBeInTheDocument();
  });

  it('calls the onChange function when the checkbox is clicked', () => {
    render(<UiCheckbox onChange={mockOnChange} label={testText} />);
    const checkboxInput: HTMLElement = screen.getByRole('checkbox');
    fireEvent.click(checkboxInput);
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('disables the checkbox when the disabled prop is true', () => {
    render(<UiCheckbox disabled onChange={mockOnChange} label={testText} />);
    const checkboxInput: HTMLElement = screen.getByRole('checkbox');
    expect(checkboxInput).toBeDisabled();
  });

  it('renders the checkbox with the provided error', () => {
    render(<UiCheckbox error onChange={mockOnChange} label={testText} />);
    const checkboxLabel: HTMLElement = screen.getByLabelText(testText);
    const checkboxInput: HTMLElement = screen.getByRole('checkbox');
    expect(checkboxLabel).toBeInTheDocument();
    // The error variant flags the input as invalid for assistive tech; the red
    // border styling lives on the visual `.ui-checkbox-box` via descendant-
    // selector sx, which jsdom's computed-style resolver cannot evaluate.
    expect(checkboxInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('supports controlled checked state', () => {
    const { rerender } = render(<UiCheckbox checked onChange={mockOnChange} label={testText} />);

    let checkboxInput: HTMLInputElement = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkboxInput).toBeChecked();

    rerender(<UiCheckbox checked={false} onChange={mockOnChange} label={testText} />);

    checkboxInput = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkboxInput).not.toBeChecked();
  });
});
