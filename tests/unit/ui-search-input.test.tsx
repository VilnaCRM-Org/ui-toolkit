import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiSearchInput, UiLink } from '../../src/components';

import mockConsoleWarn from './utils/mock-console-warn';

// UiSearchInput emits dev-only accessible-name guidance via console.warn; silence
// it for the whole file and let the dedicated block assert on the spy.
const warn = mockConsoleWarn();

const noop: (value: string) => void = () => undefined;

const suggestions: string[] = ['Top performers', 'Top sales this month', 'Top sales this year'];

// Controlled harness so the freeSolo input reflects typed text and suggestion
// picks the way a real consumer wires value/onChange.
function ControlledSearch(props: {
  initial?: string;
  options?: string[];
  onChange?: (value: string) => void;
  disabled?: boolean;
}): React.ReactElement {
  const [value, setValue] = React.useState<string>(props.initial ?? '');
  const handleChange: (next: string) => void = (next: string): void => {
    setValue(next);
    props.onChange?.(next);
  };
  return (
    <UiSearchInput
      aria-label="Search"
      value={value}
      onChange={handleChange}
      options={props.options}
      disabled={props.disabled}
    />
  );
}

async function expectSkippedInTabOrder(
  user: UserEvent,
  control: React.ReactElement
): Promise<void> {
  render(
    <>
      <UiLink href="/before">before</UiLink>
      {control}
      <UiLink href="/after">after</UiLink>
    </>
  );
  await user.tab();
  expect(screen.getByRole('link', { name: 'before' })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('link', { name: 'after' })).toHaveFocus();
}

describe('UiSearchInput — rendering and accessible name', () => {
  it('renders a combobox', () => {
    render(<UiSearchInput aria-label="Search" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('names the combobox from the aria-label prop', () => {
    render(<UiSearchInput aria-label="Search customers" />);
    expect(screen.getByRole('combobox', { name: 'Search customers' })).toBeInTheDocument();
  });

  it('names the combobox from a visible label', () => {
    render(<UiSearchInput label="Find" />);
    expect(screen.getByRole('combobox', { name: 'Find' })).toBeInTheDocument();
  });

  it('names the combobox from an external label associated by id', () => {
    render(
      <>
        <label htmlFor="q">Query</label>
        <UiSearchInput id="q" />
      </>
    );
    expect(screen.getByRole('combobox', { name: 'Query' })).toBeInTheDocument();
  });

  it('does not treat the placeholder as an accessible name', () => {
    render(<UiSearchInput aria-label="Search" placeholder="Type to search" />);
    expect(screen.queryByRole('combobox', { name: /Type to search/ })).not.toBeInTheDocument();
  });

  it('prefers the visible label over aria-label for the accessible name', () => {
    render(<UiSearchInput label="Find" aria-label="Ignored" />);
    expect(screen.getByRole('combobox', { name: 'Find' })).toBeInTheDocument();
  });

  it('falls back to aria-label when the label is empty', () => {
    render(<UiSearchInput label="" aria-label="Search" />);
    expect(screen.getByRole('combobox', { name: 'Search' })).toBeInTheDocument();
  });

  it('exposes its display name', () => {
    expect(UiSearchInput.displayName).toBe('UiSearchInput');
  });

  it('forwards the value to the input', () => {
    render(<UiSearchInput aria-label="Search" value="acme" onChange={noop} />);
    expect(screen.getByRole('combobox')).toHaveValue('acme');
  });

  it('keeps the decorative magnifier out of the accessibility tree', () => {
    render(<UiSearchInput aria-label="Search" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders no clear or dropdown-indicator buttons (magnifier only)', () => {
    render(<UiSearchInput aria-label="Search" value="acme" onChange={noop} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('UiSearchInput — error, helper and required semantics', () => {
  it('reflects the error prop through aria-invalid', () => {
    const { rerender } = render(<UiSearchInput aria-label="Search" error={false} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'false');

    rerender(<UiSearchInput aria-label="Search" error helperText="Required" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('links helperText to the input through aria-describedby', () => {
    render(<UiSearchInput aria-label="Search" helperText="Search by name or email" />);
    const input: HTMLElement = screen.getByRole('combobox');
    const helper: HTMLElement = screen.getByText('Search by name or email');
    expect(input).toHaveAttribute('aria-describedby', helper.id);
  });

  it('marks the field required for assistive technology', () => {
    render(<UiSearchInput aria-label="Search" required />);
    expect(screen.getByRole('combobox')).toBeRequired();
  });
});

describe('UiSearchInput — typeahead suggestions', () => {
  it('shows matching suggestions and reports each keystroke through onChange', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<ControlledSearch options={suggestions} onChange={onChange} />);

    await user.type(screen.getByRole('combobox'), 'Top');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(onChange).toHaveBeenCalledWith('Top');
  });

  it('fills the field and reports onChange when a suggestion is picked', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<ControlledSearch options={suggestions} onChange={onChange} />);

    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'Top');
    await user.click(screen.getByRole('option', { name: 'Top sales this month' }));

    expect(combobox).toHaveValue('Top sales this month');
    expect(onChange).toHaveBeenCalledWith('Top sales this month');
  });

  it('acts as a plain search box with no suggestions when options are omitted', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<ControlledSearch onChange={onChange} />);

    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'abc');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(combobox).toHaveValue('abc');
    expect(onChange).toHaveBeenCalledWith('abc');
  });

  it('surfaces no options at all when there are no suggestions', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiSearchInput aria-label="Search" />);

    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.click(combobox);
    await user.keyboard('{ArrowDown}');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('expands and moves aria-activedescendant with ArrowDown, keeping input focus', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledSearch options={suggestions} />);

    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'Top');
    await user.keyboard('{ArrowDown}');

    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    const renderedOptions: HTMLElement[] = screen.getAllByRole('option');
    expect(combobox).toHaveAttribute('aria-activedescendant', renderedOptions[0].id);
    expect(combobox).toHaveFocus();
  });

  it('does not throw when typing without an onChange handler', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiSearchInput aria-label="Search" options={suggestions} />);

    await user.type(screen.getByRole('combobox'), 'Top');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});

describe('UiSearchInput — disabled semantics', () => {
  it('disables the input', () => {
    render(<UiSearchInput aria-label="Search" disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('removes a disabled search input from the keyboard tab order', async () => {
    await expectSkippedInTabOrder(
      userEvent.setup(),
      <UiSearchInput aria-label="Search" disabled />
    );
  });
});

describe('UiSearchInput — accessibility guidance', () => {
  it('warns when there is no accessible name', () => {
    render(<UiSearchInput />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
  });

  it('stays quiet when an aria-label is provided', () => {
    render(<UiSearchInput aria-label="Search" />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('stays quiet when a label is provided', () => {
    render(<UiSearchInput label="Search" />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('stays quiet when an id is provided', () => {
    render(<UiSearchInput id="s" />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('warns when in error with no helperText', () => {
    render(<UiSearchInput aria-label="Search" error />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('stays quiet in error when a helperText is supplied', () => {
    render(<UiSearchInput aria-label="Search" error helperText="Required" />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('emits no warnings in production even without a name', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(<UiSearchInput />);
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('re-logs the name warning when the name is removed on re-render', () => {
    const { rerender } = render(<UiSearchInput aria-label="Search" />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));

    rerender(<UiSearchInput />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });
});
