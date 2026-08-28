import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiLink from '../../src/components/ui-link';
import UiRadioGroup from '../../src/components/ui-radio-group';
import type { UiRadioOption } from '../../src/components/ui-radio-group/types';

import mockConsoleWarn from './utils/mock-console-warn';

// UiRadioGroup emits dev-only accessibility guidance via console.warn; silence it
// for the whole file and assert on the spy in the dedicated block.
const warn = mockConsoleWarn();

const options: UiRadioOption[] = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Push', value: 'push' },
];

const noop: (value: string) => void = () => undefined;

// `error` is not only an aria flag: it repaints the radio glyph. `renderRadio`
// picks `radioStyles.radioError` over `radioStyles.radio`, which swaps the 1px
// stroke of the `.ui-radio-dot` span from the neutral grey400 token to the error
// token. These are the two Figma stroke colours for the unselected dot.
const DOT_STROKE_NEUTRAL: string = '#D0D4D8';
const DOT_STROKE_ERROR: string = '#DC3939';

// The dot is the visual glyph rendered inside the radio's button root; the input
// itself carries no colour, so the stroke has to be read off the span.
function radioDot(optionLabel: string): HTMLElement {
  const radio: HTMLElement = screen.getByRole('radio', { name: optionLabel });
  /* eslint-disable testing-library/no-node-access */
  const control: Element | null = radio.closest('.MuiButtonBase-root');
  const dot: Element | null | undefined = control?.querySelector('.ui-radio-dot');
  /* eslint-enable testing-library/no-node-access */
  if (!(dot instanceof HTMLElement)) {
    throw new Error(`No radio dot rendered for option "${optionLabel}"`);
  }
  return dot;
}

// Thin stateful wrapper for the controlled round-trip / keyboard tests: the group
// is always controlled, so a real consumer feeds the next value back via onChange.
function ControlledGroup(): React.ReactElement {
  const [value, setValue] = React.useState<string>('');
  return <UiRadioGroup options={options} aria-label="Contact" value={value} onChange={setValue} />;
}

describe('UiRadioGroup — rendering and accessible name', () => {
  it('renders a radiogroup with a radio per option', () => {
    render(<UiRadioGroup options={options} aria-label="Contact" onChange={noop} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('names each radio from its option label', () => {
    render(<UiRadioGroup options={options} aria-label="Contact" onChange={noop} />);
    expect(screen.getByRole('radio', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'SMS' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Push' })).toBeInTheDocument();
  });

  it('names the group from a visible label', () => {
    render(<UiRadioGroup options={options} label="Contact" onChange={noop} />);
    expect(screen.getByRole('radiogroup', { name: 'Contact' })).toBeInTheDocument();
  });

  it('names the group from aria-label when there is no visible label', () => {
    render(<UiRadioGroup options={options} aria-label="Choose contact" onChange={noop} />);
    expect(screen.getByRole('radiogroup', { name: 'Choose contact' })).toBeInTheDocument();
  });

  it('prefers the visible label over aria-label', () => {
    render(<UiRadioGroup options={options} label="Contact" aria-label="Ignored" onChange={noop} />);
    expect(screen.getByRole('radiogroup', { name: 'Contact' })).toBeInTheDocument();
  });

  it('falls back to aria-label when the label is empty', () => {
    render(<UiRadioGroup options={options} label="" aria-label="Contact" onChange={noop} />);
    expect(screen.getByRole('radiogroup', { name: 'Contact' })).toBeInTheDocument();
  });

  it('wires the group label id to aria-labelledby from the supplied id', () => {
    render(<UiRadioGroup options={options} label="Contact" id="contact" onChange={noop} />);
    const groupLabel: HTMLElement = screen.getByText('Contact');
    expect(groupLabel.id).toBe('contact-label');
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-labelledby', 'contact-label');
  });

  it('exposes its display name', () => {
    expect(UiRadioGroup.displayName).toBe('UiRadioGroup');
  });
});

describe('UiRadioGroup — selection', () => {
  it('reflects the controlled selected value', () => {
    render(<UiRadioGroup options={options} value="sms" aria-label="Contact" onChange={noop} />);
    expect(screen.getByRole('radio', { name: 'SMS' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Email' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Push' })).not.toBeChecked();
  });

  it('stays controlled when nothing is selected (empty, not uncontrolled)', () => {
    render(<UiRadioGroup options={options} value="" aria-label="Contact" onChange={noop} />);
    screen.getAllByRole('radio').forEach((radio: HTMLElement) => expect(radio).not.toBeChecked());
  });

  // A nullish `value` is documented to coerce to `''`, so a group that offers an
  // explicitly empty-valued option ("no preference") shows that option selected
  // when no `value` is supplied — the coercion target is observable, not just its
  // "nothing is selected" side effect.
  it('selects the empty-valued option when value is omitted', () => {
    const withNoPreference: UiRadioOption[] = [{ label: 'No preference', value: '' }, ...options];
    render(<UiRadioGroup options={withNoPreference} aria-label="Contact" onChange={noop} />);

    expect(screen.getByRole('radio', { name: 'No preference' })).toBeChecked();
    options.forEach((option: UiRadioOption) =>
      expect(screen.getByRole('radio', { name: option.label })).not.toBeChecked()
    );
  });

  it('moves the selection when the controlled value changes', () => {
    const { rerender } = render(
      <UiRadioGroup options={options} value="email" aria-label="Contact" onChange={noop} />
    );
    expect(screen.getByRole('radio', { name: 'Email' })).toBeChecked();

    rerender(<UiRadioGroup options={options} value="push" aria-label="Contact" onChange={noop} />);
    expect(screen.getByRole('radio', { name: 'Push' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Email' })).not.toBeChecked();
  });

  it('calls onChange with the option value when a radio is clicked', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiRadioGroup options={options} value="" aria-label="Contact" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: 'SMS' }));
    expect(onChange).toHaveBeenCalledWith('sms');
  });

  it('reflects a selection fed back through onChange (controlled round-trip)', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledGroup />);

    await user.click(screen.getByRole('radio', { name: 'SMS' }));
    expect(screen.getByRole('radio', { name: 'SMS' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Push' }));
    expect(screen.getByRole('radio', { name: 'Push' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'SMS' })).not.toBeChecked();
  });

  it('selects an option with the arrow keys', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledGroup />);

    await user.tab();
    expect(screen.getByRole('radio', { name: 'Email' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'SMS' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'SMS' })).toHaveFocus();
  });

  it('does not throw when selecting without an onChange handler', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiRadioGroup options={options} value="" aria-label="Contact" />);

    await user.click(screen.getByRole('radio', { name: 'Email' }));
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });
});

describe('UiRadioGroup — disabled semantics', () => {
  it('disables every radio when the group is disabled', () => {
    render(<UiRadioGroup options={options} aria-label="Contact" disabled onChange={noop} />);
    screen.getAllByRole('radio').forEach((radio: HTMLElement) => expect(radio).toBeDisabled());
  });

  it('disables only the option flagged disabled', () => {
    render(
      <UiRadioGroup
        options={[
          { label: 'Email', value: 'email' },
          { label: 'SMS', value: 'sms', disabled: true },
        ]}
        aria-label="Contact"
        onChange={noop}
      />
    );
    expect(screen.getByRole('radio', { name: 'Email' })).toBeEnabled();
    expect(screen.getByRole('radio', { name: 'SMS' })).toBeDisabled();
  });

  it('removes a disabled group from the keyboard tab order', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <>
        <UiLink href="/before">before</UiLink>
        <UiRadioGroup options={options} aria-label="Contact" disabled onChange={noop} />
        <UiLink href="/after">after</UiLink>
      </>
    );
    await user.tab();
    expect(screen.getByRole('link', { name: 'before' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'after' })).toHaveFocus();
  });
});

describe('UiRadioGroup — error, helper and required semantics', () => {
  it('flags the group invalid through aria-invalid only when in error', () => {
    const { rerender } = render(
      <UiRadioGroup options={options} aria-label="Contact" error={false} onChange={noop} />
    );
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-invalid');

    rerender(
      <UiRadioGroup
        options={options}
        aria-label="Contact"
        error
        helperText="Pick one"
        onChange={noop}
      />
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
  });

  it('links helperText through aria-describedby', () => {
    render(
      <UiRadioGroup
        options={options}
        label="Contact"
        helperText="Select a channel"
        onChange={noop}
      />
    );
    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription('Select a channel');
  });

  it('derives the helper-text id from the supplied id', () => {
    render(
      <UiRadioGroup
        options={options}
        aria-label="Contact"
        id="contact"
        helperText="Select a channel"
        onChange={noop}
      />
    );
    expect(screen.getByText('Select a channel').id).toBe('contact-helper-text');
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-describedby',
      'contact-helper-text'
    );
  });

  it('renders no helper text and no aria-describedby when helperText is omitted', () => {
    render(<UiRadioGroup options={options} aria-label="Contact" onChange={noop} />);
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-describedby');
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector('.MuiFormHelperText-root')).not.toBeInTheDocument();
  });

  it('marks the radios required only when required is set', () => {
    const { rerender } = render(
      <UiRadioGroup options={options} label="Contact" required onChange={noop} />
    );
    screen.getAllByRole('radio').forEach((radio: HTMLElement) => expect(radio).toBeRequired());

    rerender(<UiRadioGroup options={options} label="Contact" onChange={noop} />);
    screen.getAllByRole('radio').forEach((radio: HTMLElement) => expect(radio).not.toBeRequired());
  });

  it('strokes every radio dot with the error colour when the group is in error', () => {
    render(
      <UiRadioGroup
        options={options}
        aria-label="Contact"
        error
        helperText="Pick one"
        onChange={noop}
      />
    );

    options.forEach((option: UiRadioOption) =>
      expect(radioDot(option.label)).toHaveStyle({ borderColor: DOT_STROKE_ERROR })
    );
  });

  it('keeps the neutral radio stroke when error is unset or explicitly false', () => {
    const { rerender } = render(
      <UiRadioGroup options={options} aria-label="Contact" onChange={noop} />
    );
    expect(radioDot('Email')).toHaveStyle({ borderColor: DOT_STROKE_NEUTRAL });

    rerender(<UiRadioGroup options={options} aria-label="Contact" error={false} onChange={noop} />);
    expect(radioDot('Email')).toHaveStyle({ borderColor: DOT_STROKE_NEUTRAL });
  });
});

describe('UiRadioGroup — accessibility guidance', () => {
  it('warns when there is no accessible name', () => {
    render(<UiRadioGroup options={options} onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
  });

  it('warns when the label is blank whitespace and nothing else names it', () => {
    render(<UiRadioGroup options={options} label="   " onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('stays quiet when a label, aria-label or id is provided', () => {
    const { rerender } = render(<UiRadioGroup options={options} label="Contact" onChange={noop} />);
    rerender(<UiRadioGroup options={options} aria-label="Contact" onChange={noop} />);
    rerender(<UiRadioGroup options={options} id="contact" onChange={noop} />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('warns when in error with no helperText', () => {
    render(<UiRadioGroup options={options} aria-label="Contact" error onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('stays quiet in error when a helperText is supplied', () => {
    render(
      <UiRadioGroup
        options={options}
        aria-label="Contact"
        error
        helperText="Required"
        onChange={noop}
      />
    );
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('warns in error when helperText is blank whitespace', () => {
    render(
      <UiRadioGroup options={options} aria-label="Contact" error helperText="   " onChange={noop} />
    );
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('stays quiet in error when helperText is a non-text node', () => {
    render(
      <UiRadioGroup
        options={options}
        aria-label="Contact"
        error
        helperText={<span>Pick a channel</span>}
        onChange={noop}
      />
    );
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('emits no warnings in production even without a name', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(<UiRadioGroup options={options} onChange={noop} />);
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('re-logs the name warning when the name is removed on re-render', () => {
    const { rerender } = render(
      <UiRadioGroup options={options} aria-label="Contact" onChange={noop} />
    );
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
    rerender(<UiRadioGroup options={options} onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });
});
