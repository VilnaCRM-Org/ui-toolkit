import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';

import UiInput from '../../src/components/ui-input';
import { inputAria, inputDescribedBy } from '../../src/components/ui-input/aria';

import { testText, testEmail, testPlaceholder } from './constants';
import mockConsoleWarn from './utils/mock-console-warn';

const testType: string = 'email';

// UiInput emits dev-only accessibility guidance via console.warn; silence it for
// the whole file (existing specs render deliberately minimal inputs) and let the
// dedicated blocks below assert on the spy.
const warn = mockConsoleWarn();

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

  it('forwards size and variant to UiInput', () => {
    render(<UiInput size="small" variant="filled" />);

    const input: HTMLElement = screen.getByRole('textbox');
    // The filled variant class lands on the input element itself.
    expect(input).toHaveClass('MuiFilledInput-input');
    // The filled-root and small-size classes live on the MUI wrapper element.
    // eslint-disable-next-line testing-library/no-node-access -- wrapper class, no semantic query
    const inputRoot: HTMLElement | null = input.closest('.MuiInputBase-root');
    expect(inputRoot).toHaveClass('MuiFilledInput-root');
    expect(inputRoot).toHaveClass('MuiInputBase-sizeSmall');
  });
});

describe('UiInput accessible-name guidance', () => {
  it('warns when the input has no accessible name', () => {
    render(<UiInput />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
  });

  it('stays quiet when a label prop is provided', () => {
    render(<UiInput label="Email" />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('emits nothing at all for a labelled input that is not in error', () => {
    // No warning of any kind — guards against emitting `console.warn(null)` when
    // there is nothing to report.
    render(<UiInput label="Email" />);
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('stays quiet when an id links an external label', () => {
    render(
      <>
        <label htmlFor="email-field">Email</label>
        <UiInput id="email-field" />
      </>
    );
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('stays quiet when an aria-label is supplied via slotProps.input', () => {
    render(<UiInput slotProps={{ input: { 'aria-label': 'Email' } }} />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('stays quiet when the input slot is configured via InputProps', () => {
    render(<UiInput InputProps={{ inputProps: { 'aria-label': 'Email' } }} />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('emits no warnings in production even without an accessible name', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(<UiInput />);
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('re-logs the name warning when an accessible name is removed on re-render', () => {
    // The guidance lives in an effect keyed to the derived warning state, so a
    // named→unnamed transition must re-log (guards against a stale mount-only cache).
    const { rerender } = render(<UiInput label="Email" />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));

    rerender(<UiInput />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });
});

describe('UiInput error-description guidance', () => {
  it('warns when the error state has no helperText to explain it', () => {
    render(<UiInput label="Email" error />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('stays quiet when the error state is paired with a helperText', () => {
    render(<UiInput label="Email" error helperText="Enter a valid email" />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('does not warn about helperText when the field is not in error', () => {
    render(<UiInput label="Email" />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });
});

describe('UiInput — native-input ARIA the consumer can drive', () => {
  it('writes describedBy onto the input', () => {
    render(<UiInput label="Password" describedBy="pw-rules" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'pw-rules');
  });

  it('composes describedBy with helperText rather than replacing it', () => {
    render(<UiInput id="pw" label="Password" helperText="Too short" describedBy="pw-rules" />);
    // Helper text first: it carries the reason the field is invalid, which should
    // be announced ahead of any supplementary description. Replacing instead of
    // composing would silently unlink helperText.
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby',
      'pw-helper-text pw-rules'
    );
  });

  it('supplies a field id when the consumer gave none, so the helper id resolves', () => {
    render(<UiInput label="Password" helperText="Too short" describedBy="pw-rules" />);
    const input: HTMLElement = screen.getByRole('textbox');
    const describedBy: string = input.getAttribute('aria-describedby') ?? '';
    expect(describedBy.endsWith('pw-rules')).toBe(true);
    expect(describedBy.split(' ')).toHaveLength(2);
    expect(describedBy).toContain('-helper-text');
  });

  it('marks a required field with aria-required as well as the native attribute', () => {
    render(<UiInput label="Email" required />);
    const input: HTMLElement = screen.getByRole('textbox');
    // toBeRequired() passes on EITHER the native attribute or the ARIA one, so
    // the ARIA emission itself is pinned directly on `inputAria` below.
    expect(input).toBeRequired();
  });

  it('leaves the DOM untouched when it owns no ARIA of its own', () => {
    render(<UiInput label="Plain" />);
    const input: HTMLElement = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toBeRequired();
  });

  it('does not clobber an aria-describedby passed through the input slot', () => {
    render(
      <UiInput
        label="Password"
        required
        slotProps={{ htmlInput: { 'aria-describedby': 'consumer-owned' } }}
      />
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'consumer-owned');
  });
});

describe('inputAria — the attribute map the control writes', () => {
  it('emits aria-required only for a required field', () => {
    expect(inputAria({ required: true }, 'f')['aria-required']).toBe(true);
    expect(inputAria({}, 'f')['aria-required']).toBeUndefined();
  });

  it('composes the helper-text id ahead of the consumer ids', () => {
    expect(inputDescribedBy({ helperText: 'Too short', describedBy: 'rules' }, 'pw')).toBe(
      'pw-helper-text rules'
    );
  });

  it('omits the helper id when there is no helper text or no field id', () => {
    expect(inputDescribedBy({ describedBy: 'rules' }, 'pw')).toBe('rules');
    expect(inputDescribedBy({ helperText: 'Too short', describedBy: 'rules' }, undefined)).toBe(
      'rules'
    );
  });

  it('is undefined when nothing describes the field', () => {
    expect(inputDescribedBy({}, 'pw')).toBeUndefined();
  });
});

describe('UiInput — required must not delete a consumer description', () => {
  it('keeps an aria-describedby set through the input slot when required is added', () => {
    // `slotProps.input` is the pre-existing escape hatch this suite documents
    // above. Writing `'aria-describedby': undefined` into `slotProps.htmlInput`
    // still creates the KEY, and object spread lets that undefined overwrite the
    // input-slot value — so adding `required` silently unlinked the description.
    render(
      <UiInput
        label="Password"
        required
        slotProps={{ input: { 'aria-describedby': 'slot-input-desc' } }}
      />
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'slot-input-desc');
  });

  it('lets an explicit describedBy take over from the input slot', () => {
    render(
      <UiInput
        label="Password"
        describedBy="pw-rules"
        slotProps={{ input: { 'aria-describedby': 'slot-input-desc' } }}
      />
    );
    // Deliberate: once the consumer opts into the prop, that is the description
    // this control owns. Only the no-value case must leave the slot untouched.
    const describedBy: string = screen.getByRole('textbox').getAttribute('aria-describedby') ?? '';
    expect(describedBy).toContain('pw-rules');
    expect(describedBy).not.toContain('slot-input-desc');
  });
});

describe('UiInput — a callback htmlInput slot survives the ARIA merge', () => {
  it('invokes an owner-state callback instead of spreading the function', () => {
    // MUI lets a slot be `(ownerState) => props`. Spreading a FUNCTION copies no
    // own enumerable properties, so the callback and everything it returned were
    // silently dropped the moment this control had ARIA of its own to write.
    render(
      <UiInput
        label="Email"
        required
        slotProps={{ htmlInput: () => ({ 'data-source': 'callback' }) }}
      />
    );
    const input: HTMLElement = screen.getByRole('textbox');
    expect(input).toHaveAttribute('data-source', 'callback');
    expect(input).toBeRequired();
  });
});
