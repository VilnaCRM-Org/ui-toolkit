import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiSelectWithSearch, UiLink } from '../../src/components';
import type { UiSelectWithSearchOption } from '../../src/components/ui-select-with-search/types';

import mockConsoleWarn from './utils/mock-console-warn';

// UiSelectWithSearch emits dev-only accessibility guidance via console.warn;
// silence it for the whole file and assert on the spy in the dedicated block.
const warn = mockConsoleWarn();

const options: UiSelectWithSearchOption[] = [
  { label: 'Kyiv', value: 'kyiv' },
  { label: 'Lviv', value: 'lviv' },
  { label: 'Odesa', value: 'odesa' },
];

const noop: (value: UiSelectWithSearchOption | null) => void = () => undefined;

// Clicking opens the popup (without highlighting an option yet); callers press
// ArrowDown to move the highlight / aria-activedescendant.
async function openListbox(user: UserEvent): Promise<HTMLElement> {
  const combobox: HTMLElement = screen.getByRole('combobox');
  await user.click(combobox);
  return combobox;
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

describe('UiSelectWithSearch — rendering and accessible name', () => {
  it('renders a combobox', () => {
    render(<UiSelectWithSearch options={options} aria-label="City" onChange={noop} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('names the combobox from a visible label', () => {
    render(<UiSelectWithSearch options={options} label="City" onChange={noop} />);
    expect(screen.getByRole('combobox', { name: 'City' })).toBeInTheDocument();
  });

  it('names the combobox from aria-label when there is no visible label', () => {
    render(<UiSelectWithSearch options={options} aria-label="Choose a city" onChange={noop} />);
    expect(screen.getByRole('combobox', { name: 'Choose a city' })).toBeInTheDocument();
  });

  it('prefers the visible label over aria-label for the accessible name', () => {
    render(
      <UiSelectWithSearch options={options} label="City" aria-label="Ignored" onChange={noop} />
    );
    expect(screen.getByRole('combobox', { name: 'City' })).toBeInTheDocument();
  });

  it('falls back to aria-label when the label is empty', () => {
    render(<UiSelectWithSearch options={options} label="" aria-label="City" onChange={noop} />);
    expect(screen.getByRole('combobox', { name: 'City' })).toBeInTheDocument();
  });

  it('exposes its display name', () => {
    expect(UiSelectWithSearch.displayName).toBe('UiSelectWithSearch');
  });

  it('renders the dropdown chevron as a named, non-tabbable button', () => {
    render(<UiSelectWithSearch options={options} aria-label="City" onChange={noop} />);
    // Named explicitly: a dirty field also mounts the clear x, so a bare
    // getByRole('button') would become ambiguous the moment this render gains a value.
    const toggle: HTMLElement = screen.getByRole('button', { name: /open|close/i });
    expect(toggle).toHaveAccessibleName();
    expect(toggle).toHaveAttribute('tabindex', '-1');
  });

  it('displays the selected option label', () => {
    render(
      <UiSelectWithSearch options={options} value={options[0]} aria-label="City" onChange={noop} />
    );
    expect(screen.getByRole('combobox')).toHaveValue('Kyiv');
  });

  it('renders empty when the value is null', () => {
    render(<UiSelectWithSearch options={options} value={null} aria-label="City" onChange={noop} />);
    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('marks the current value as the selected option when the listbox opens', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiSelectWithSearch options={options} value={options[0]} aria-label="City" onChange={noop} />
    );

    await openListbox(user);
    expect(screen.getByRole('option', { name: 'Kyiv' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Lviv' })).toHaveAttribute('aria-selected', 'false');
  });
});

describe('UiSelectWithSearch — error, helper and required semantics', () => {
  it('reflects the error prop through aria-invalid', () => {
    const { rerender } = render(
      <UiSelectWithSearch options={options} aria-label="City" error={false} onChange={noop} />
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'false');

    rerender(
      <UiSelectWithSearch
        options={options}
        aria-label="City"
        error
        helperText="Pick a city"
        onChange={noop}
      />
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('links helperText to the combobox through aria-describedby', () => {
    render(
      <UiSelectWithSearch
        options={options}
        label="City"
        helperText="Start typing to filter"
        onChange={noop}
      />
    );
    const combobox: HTMLElement = screen.getByRole('combobox');
    const helper: HTMLElement = screen.getByText('Start typing to filter');
    expect(combobox).toHaveAttribute('aria-describedby', helper.id);
  });

  it('marks the combobox required for assistive technology', () => {
    render(<UiSelectWithSearch options={options} label="City" required onChange={noop} />);
    expect(screen.getByRole('combobox')).toBeRequired();
  });
});

describe('UiSelectWithSearch — combobox ARIA and keyboard navigation', () => {
  it('preserves the MUI combobox wiring through the custom renderInput', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiSelectWithSearch options={options} aria-label="City" onChange={noop} />);

    const combobox: HTMLElement = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveAttribute('aria-autocomplete', 'list');

    await user.click(combobox);
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(combobox).toHaveAttribute('aria-controls');
  });

  it('moves aria-activedescendant through options while focus stays on the input', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiSelectWithSearch options={options} aria-label="City" onChange={noop} />);

    const combobox: HTMLElement = await openListbox(user);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    const renderedOptions: HTMLElement[] = screen.getAllByRole('option');

    await user.keyboard('{ArrowDown}');
    expect(combobox).toHaveAttribute('aria-activedescendant', renderedOptions[0].id);
    expect(combobox).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(combobox).toHaveAttribute('aria-activedescendant', renderedOptions[1].id);
  });

  it('filters the options as the user types', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiSelectWithSearch options={options} aria-label="City" onChange={noop} />);

    await user.tab();
    await user.keyboard('Lv');
    const filtered: HTMLElement[] = screen.getAllByRole('option');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toHaveTextContent('Lviv');
  });

  it('does not trap keyboard focus — Tab closes the popup and moves on', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <>
        <UiSelectWithSearch options={options} aria-label="City" onChange={noop} />
        <UiLink href="/after">after</UiLink>
      </>
    );

    await openListbox(user);
    await user.tab();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'after' })).toHaveFocus();
  });
});

describe('UiSelectWithSearch — selection', () => {
  it('reports the selected option through onChange and closes the popup', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiSelectWithSearch options={options} aria-label="City" onChange={onChange} />);

    const combobox: HTMLElement = await openListbox(user);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(options[0]);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(combobox).toHaveFocus();
  });

  it('selects an option by click', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiSelectWithSearch options={options} aria-label="City" onChange={onChange} />);

    await openListbox(user);
    await user.click(screen.getByRole('option', { name: 'Lviv' }));
    expect(onChange).toHaveBeenCalledWith(options[1]);
  });

  it('does not throw when selecting without an onChange handler', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiSelectWithSearch options={options} aria-label="City" />);

    await openListbox(user);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('UiSelectWithSearch — disabled semantics', () => {
  it('disables the combobox', () => {
    render(<UiSelectWithSearch options={options} aria-label="City" disabled onChange={noop} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('removes a disabled combobox from the keyboard tab order', async () => {
    await expectSkippedInTabOrder(
      userEvent.setup(),
      <UiSelectWithSearch options={options} aria-label="City" disabled onChange={noop} />
    );
  });
});

describe('UiSelectWithSearch — accessibility guidance', () => {
  it('warns when there is no accessible name', () => {
    render(<UiSelectWithSearch options={options} onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
  });

  it('stays quiet when a label is provided', () => {
    render(<UiSelectWithSearch options={options} label="City" onChange={noop} />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('stays quiet when an aria-label is provided', () => {
    render(<UiSelectWithSearch options={options} aria-label="City" onChange={noop} />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('stays quiet when an id is provided', () => {
    render(<UiSelectWithSearch options={options} id="city" onChange={noop} />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('warns when in error with no helperText', () => {
    render(<UiSelectWithSearch options={options} aria-label="City" error onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('stays quiet in error when a helperText is supplied', () => {
    render(
      <UiSelectWithSearch
        options={options}
        aria-label="City"
        error
        helperText="Required"
        onChange={noop}
      />
    );
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('emits no warnings in production even without a name', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(<UiSelectWithSearch options={options} onChange={noop} />);
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('re-logs the name warning when the name is removed on re-render', () => {
    const { rerender } = render(
      <UiSelectWithSearch options={options} aria-label="City" onChange={noop} />
    );
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));

    rerender(<UiSelectWithSearch options={options} onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('force-opens the dropdown inline (demo props)', () => {
    render(<UiSelectWithSearch aria-label="City" options={options} open disablePortal />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});

describe('UiSelectWithSearch — clearing a selection', () => {
  it('names the clear button after the value it removes', () => {
    render(
      <UiSelectWithSearch options={options} value={options[0]} aria-label="City" onChange={noop} />
    );
    // MUI's stock name is a bare "Clear"; with several selects on one form that is
    // several identically-named controls.
    expect(screen.getByRole('button', { name: 'Clear Kyiv' })).toBeInTheDocument();
  });

  it('mounts no clear button while nothing is selected', () => {
    render(<UiSelectWithSearch options={options} value={null} aria-label="City" onChange={noop} />);
    expect(screen.queryByRole('button', { name: /^Clear/ })).not.toBeInTheDocument();
  });

  it('puts the clear button in the tab order, right after the combobox', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiSelectWithSearch options={options} value={options[0]} aria-label="City" onChange={noop} />
    );
    await user.tab();
    expect(screen.getByRole('combobox')).toHaveFocus();
    await user.tab();
    // MUI ships the clear button `tabIndex={-1}`. That was fine while it was a
    // hover-only convenience; as the primary way to remove a selection it has to
    // be reachable, because the field holds the value's own label so "backspace
    // on an empty input" is not an equivalent path.
    expect(screen.getByRole('button', { name: 'Clear Kyiv' })).toHaveFocus();
  });

  it('clears the selection when the clear button is activated from the keyboard', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiSelectWithSearch
        options={options}
        value={options[0]}
        aria-label="City"
        onChange={onChange}
      />
    );
    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('keeps focus on the combobox after a selection', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiSelectWithSearch options={options} aria-label="City" onChange={onChange} />);
    const combobox: HTMLElement = await openListbox(user);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(options[0]);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    // Regression guard: selecting must never blur to <body>. MUI's `blurOnSelect`
    // does exactly that, and its "mouse" value fires on Enter too, so there is no
    // modality-split version of it that spares the keyboard (SC 2.4.3 / 3.2.2).
    expect(combobox).toHaveFocus();
  });
});
