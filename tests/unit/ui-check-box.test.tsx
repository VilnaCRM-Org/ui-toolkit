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

describe('UiCheckbox required (accessibility)', () => {
  it('marks the underlying input as required for assistive technology', () => {
    render(<UiCheckbox required onChange={mockOnChange} label={testText} />);
    expect(screen.getByRole('checkbox')).toBeRequired();
  });

  it('leaves the input optional by default', () => {
    render(<UiCheckbox onChange={mockOnChange} label={testText} />);
    expect(screen.getByRole('checkbox')).not.toBeRequired();
  });
});

describe('UiCheckbox helperText (accessibility)', () => {
  const helperMessage: string = 'You must accept the terms';

  it('renders a helper text linked to the input via aria-describedby', () => {
    render(<UiCheckbox helperText={helperMessage} onChange={mockOnChange} label={testText} />);

    const checkbox: HTMLElement = screen.getByRole('checkbox');
    const helper: HTMLElement = screen.getByText(helperMessage);

    // The generated id must carry the `-helper-text` suffix and be the exact
    // target of aria-describedby, so screen readers announce the description.
    expect(helper.id).toMatch(/-helper-text$/);
    expect(checkbox).toHaveAttribute('aria-describedby', helper.id);
  });

  it('associates the helper text alongside the aria-invalid error flag', () => {
    render(
      <UiCheckbox error helperText={helperMessage} onChange={mockOnChange} label={testText} />
    );

    const checkbox: HTMLElement = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAttribute('aria-describedby', screen.getByText(helperMessage).id);
  });

  it('renders no helper text and no aria-describedby when helperText is omitted', () => {
    render(<UiCheckbox onChange={mockOnChange} label={testText} />);

    const checkbox: HTMLElement = screen.getByRole('checkbox');
    expect(checkbox).not.toHaveAttribute('aria-describedby');
    // Without helperText the component must return the bare control — not the
    // FormHelperText wrapper (an empty helper `<p>` would still be a11y noise).
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector('.MuiFormHelperText-root')).not.toBeInTheDocument();
  });
});
