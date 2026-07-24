import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiMultiSelect, UiLink } from '../../src/components';
import type { UiMultiSelectOption } from '../../src/components/ui-multi-select/types';

import mockConsoleWarn from './utils/mock-console-warn';

// UiMultiSelect emits dev-only accessibility guidance via console.warn; silence it
// for the whole file and assert on the spy in the dedicated block.
const warn = mockConsoleWarn();

const options: UiMultiSelectOption[] = [
  { label: 'Kyiv', value: 'kyiv' },
  { label: 'Lviv', value: 'lviv' },
  { label: 'Odesa', value: 'odesa' },
];

const noop: (value: UiMultiSelectOption[]) => void = () => undefined;

describe('UiMultiSelect — filled-field stroke merge', () => {
  it('merges a consumer sx object while chips fill the field', () => {
    render(
      <UiMultiSelect
        options={options}
        value={[options[0]]}
        aria-label="Cities"
        onChange={noop}
        sx={{ marginTop: '4px' }}
      />
    );
    const combobox: HTMLElement = screen.getByRole('combobox', { name: 'Cities' });
    expect(combobox).toBeInTheDocument();
    // The consumer sx merges onto the Autocomplete root alongside the filled stroke;
    // assert the merged style actually reaches the DOM (not just that the field renders).
    // eslint-disable-next-line testing-library/no-node-access -- root wrapper, no semantic query
    const root: HTMLElement | null = combobox.closest('.MuiAutocomplete-root');
    expect(root).toHaveStyle({ marginTop: '4px' });
  });

  it('merges a consumer sx array while chips fill the field', () => {
    render(
      <UiMultiSelect
        options={options}
        value={[options[0]]}
        aria-label="Cities"
        onChange={noop}
        sx={[{ marginTop: '4px' }]}
      />
    );
    const combobox: HTMLElement = screen.getByRole('combobox', { name: 'Cities' });
    expect(combobox).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access -- root wrapper, no semantic query
    const root: HTMLElement | null = combobox.closest('.MuiAutocomplete-root');
    expect(root).toHaveStyle({ marginTop: '4px' });
  });
});

async function openListbox(user: UserEvent): Promise<HTMLElement> {
  const combobox: HTMLElement = screen.getByRole('combobox');
  await user.click(combobox);
  return combobox;
}

describe('UiMultiSelect — rendering and accessible name', () => {
  it('renders a combobox', () => {
    render(<UiMultiSelect options={options} aria-label="Cities" onChange={noop} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('names the combobox from a visible label', () => {
    render(<UiMultiSelect options={options} label="Cities" onChange={noop} />);
    expect(screen.getByRole('combobox', { name: 'Cities' })).toBeInTheDocument();
  });

  it('names the combobox from aria-label when there is no visible label', () => {
    render(<UiMultiSelect options={options} aria-label="Choose cities" onChange={noop} />);
    expect(screen.getByRole('combobox', { name: 'Choose cities' })).toBeInTheDocument();
  });

  it('prefers the visible label over aria-label', () => {
    render(<UiMultiSelect options={options} label="Cities" aria-label="Ignored" onChange={noop} />);
    expect(screen.getByRole('combobox', { name: 'Cities' })).toBeInTheDocument();
  });

  it('falls back to aria-label when the label is empty', () => {
    render(<UiMultiSelect options={options} label="" aria-label="Cities" onChange={noop} />);
    expect(screen.getByRole('combobox', { name: 'Cities' })).toBeInTheDocument();
  });

  it('exposes its display name', () => {
    expect(UiMultiSelect.displayName).toBe('UiMultiSelect');
  });

  it('renders the dropdown chevron as a named, non-tabbable button', () => {
    render(<UiMultiSelect options={options} aria-label="Cities" onChange={noop} />);
    const toggle: HTMLElement = screen.getByRole('button', { name: /open/i });
    expect(toggle).toHaveAttribute('tabindex', '-1');
  });

  it('shows a placeholder only while nothing is selected', () => {
    const { rerender } = render(
      <UiMultiSelect
        options={options}
        aria-label="Cities"
        placeholder="Pick some"
        onChange={noop}
      />
    );
    expect(screen.getByPlaceholderText('Pick some')).toBeInTheDocument();

    rerender(
      <UiMultiSelect
        options={options}
        aria-label="Cities"
        placeholder="Pick some"
        value={[options[0]]}
        onChange={noop}
      />
    );
    expect(screen.queryByPlaceholderText('Pick some')).not.toBeInTheDocument();
  });

  it('force-opens the dropdown inline (demo props)', () => {
    render(<UiMultiSelect aria-label="Roles" options={options} open disablePortal />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});

describe('UiMultiSelect — removable chips', () => {
  it('renders a chip for each selected option', () => {
    render(
      <UiMultiSelect
        options={options}
        value={[options[0], options[2]]}
        aria-label="Cities"
        onChange={noop}
      />
    );
    expect(screen.getByText('Kyiv')).toBeInTheDocument();
    expect(screen.getByText('Odesa')).toBeInTheDocument();
  });

  it('gives each chip a named delete control kept out of the tab order', () => {
    render(
      <UiMultiSelect options={options} value={[options[0]]} aria-label="Cities" onChange={noop} />
    );
    const remove: HTMLElement = screen.getByRole('button', { name: 'Remove Kyiv' });
    expect(remove).toHaveAttribute('tabindex', '-1');
  });

  it('removes the focused chip with ArrowLeft then Delete', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiMultiSelect
        options={options}
        value={[options[0], options[1]]}
        aria-label="Cities"
        onChange={onChange}
      />
    );

    const combobox: HTMLElement = await openListbox(user);
    await user.keyboard('{Escape}'); // close the popup, keep focus on the input
    await user.keyboard('{ArrowLeft}'); // roving focus onto the last chip (Lviv)
    await user.keyboard('{Delete}');
    expect(onChange).toHaveBeenCalledWith([options[0]]);
    expect(combobox).toHaveFocus();
  });

  it('removes a chip through onChange when its delete control is clicked', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiMultiSelect
        options={options}
        value={[options[0], options[1]]}
        aria-label="Cities"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Remove Kyiv' }));
    expect(onChange).toHaveBeenCalledWith([options[1]]);
  });

  it('removes the last chip with Backspace on an empty input', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiMultiSelect
        options={options}
        value={[options[0], options[1]]}
        aria-label="Cities"
        onChange={onChange}
      />
    );

    const combobox: HTMLElement = await openListbox(user);
    await user.keyboard('{Escape}'); // close the popup, keep focus on the input
    await user.keyboard('{Backspace}');
    expect(onChange).toHaveBeenCalledWith([options[0]]);
    expect(combobox).toHaveFocus();
  });
});

describe('UiMultiSelect — listbox and multi-selection', () => {
  it('marks the listbox multi-selectable and names it from the field', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiMultiSelect options={options} label="Cities" onChange={noop} />);

    await openListbox(user);
    const listbox: HTMLElement = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    expect(listbox).toHaveAccessibleName('Cities');
  });

  it('reflects selected options with aria-selected', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiMultiSelect options={options} value={[options[0]]} aria-label="Cities" onChange={noop} />
    );

    await openListbox(user);
    expect(screen.getByRole('option', { name: 'Kyiv' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Lviv' })).toHaveAttribute('aria-selected', 'false');
  });

  it('matches selection by value rather than object identity', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    // A fresh object, structurally equal to options[0] but NOT the same reference —
    // the real controlled-consumer case (value rebuilt from a separate fetch). This
    // only holds because isOptionEqualToValue matches by `.value`, not identity.
    render(
      <UiMultiSelect
        options={options}
        value={[{ label: 'Kyiv', value: 'kyiv' }]}
        aria-label="Cities"
        onChange={onChange}
      />
    );
    expect(screen.getByText('Kyiv')).toBeInTheDocument();

    await openListbox(user);
    expect(screen.getByRole('option', { name: 'Kyiv' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Lviv' })).toHaveAttribute('aria-selected', 'false');
    // Re-picking the value-equal option deselects it (would duplicate under
    // reference equality).
    await user.click(screen.getByRole('option', { name: 'Kyiv' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('adds an option and keeps the popup open on selection', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiMultiSelect
        options={options}
        value={[options[0]]}
        aria-label="Cities"
        onChange={onChange}
      />
    );

    await openListbox(user);
    await user.click(screen.getByRole('option', { name: 'Lviv' }));
    expect(onChange).toHaveBeenCalledWith([options[0], options[1]]);
    // disableCloseOnSelect keeps the listbox open for the next pick.
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('toggles a selected option off when picked again', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiMultiSelect
        options={options}
        value={[options[0]]}
        aria-label="Cities"
        onChange={onChange}
      />
    );

    await openListbox(user);
    await user.click(screen.getByRole('option', { name: 'Kyiv' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('filters options as the user types', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiMultiSelect options={options} aria-label="Cities" onChange={noop} />);

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('Lv');
    const filtered: HTMLElement[] = screen.getAllByRole('option');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toHaveTextContent('Lviv');
  });

  it('does not throw when selecting without an onChange handler', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiMultiSelect options={options} aria-label="Cities" />);

    await openListbox(user);
    await user.click(screen.getByRole('option', { name: 'Kyiv' }));
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('does not trap keyboard focus — Tab moves on', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <>
        <UiMultiSelect options={options} aria-label="Cities" onChange={noop} />
        <UiLink href="/after">after</UiLink>
      </>
    );

    await openListbox(user);
    await user.tab();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'after' })).toHaveFocus();
  });
});

describe('UiMultiSelect — status announcements', () => {
  it('exposes an empty polite status region at mount', () => {
    render(<UiMultiSelect options={options} aria-label="Cities" onChange={noop} />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('announces an addition with the running count', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiMultiSelect options={options} value={[options[0]]} aria-label="Cities" onChange={noop} />
    );

    await openListbox(user);
    await user.click(screen.getByRole('option', { name: 'Lviv' }));
    expect(screen.getByRole('status')).toHaveTextContent('Lviv added, 2 selected');
  });

  it('announces a removal on delete-control click', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiMultiSelect options={options} value={[options[0]]} aria-label="Cities" onChange={noop} />
    );

    await user.click(screen.getByRole('button', { name: 'Remove Kyiv' }));
    expect(screen.getByRole('status')).toHaveTextContent('Kyiv removed, 0 selected');
  });
});

describe('UiMultiSelect — error, helper and required semantics', () => {
  it('reflects the error prop through aria-invalid', () => {
    const { rerender } = render(
      <UiMultiSelect options={options} aria-label="Cities" error={false} onChange={noop} />
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'false');

    rerender(
      <UiMultiSelect
        options={options}
        aria-label="Cities"
        error
        helperText="Pick a city"
        onChange={noop}
      />
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('links helperText through aria-describedby', () => {
    render(
      <UiMultiSelect
        options={options}
        label="Cities"
        helperText="Select at least one"
        onChange={noop}
      />
    );
    expect(screen.getByRole('combobox')).toHaveAccessibleDescription('Select at least one');
  });

  it('is required only while the selection is empty', () => {
    const { rerender } = render(
      <UiMultiSelect options={options} label="Cities" required value={[]} onChange={noop} />
    );
    expect(screen.getByRole('combobox')).toBeRequired();

    rerender(
      <UiMultiSelect
        options={options}
        label="Cities"
        required
        value={[options[0]]}
        onChange={noop}
      />
    );
    expect(screen.getByRole('combobox')).not.toBeRequired();
  });
});

describe('UiMultiSelect — disabled semantics', () => {
  it('disables the combobox and makes chips read-only', () => {
    render(
      <UiMultiSelect
        options={options}
        value={[options[0]]}
        aria-label="Cities"
        disabled
        onChange={noop}
      />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Remove Kyiv' })).not.toBeInTheDocument();
    // The chip text remains readable.
    expect(screen.getByText('Kyiv')).toBeInTheDocument();
  });

  it('removes a disabled combobox from the keyboard tab order', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <>
        <UiLink href="/before">before</UiLink>
        <UiMultiSelect options={options} aria-label="Cities" disabled onChange={noop} />
        <UiLink href="/after">after</UiLink>
      </>
    );
    await user.tab();
    expect(screen.getByRole('link', { name: 'before' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'after' })).toHaveFocus();
  });
});

describe('UiMultiSelect — accessibility guidance', () => {
  it('warns when there is no accessible name', () => {
    render(<UiMultiSelect options={options} onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
  });

  it('warns when the label is blank whitespace and nothing else names it', () => {
    render(<UiMultiSelect options={options} label="   " onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('stays quiet when a label, aria-label or id is provided', () => {
    const { rerender } = render(<UiMultiSelect options={options} label="Cities" onChange={noop} />);
    rerender(<UiMultiSelect options={options} aria-label="Cities" onChange={noop} />);
    rerender(<UiMultiSelect options={options} id="cities" onChange={noop} />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('warns when in error with no helperText', () => {
    render(<UiMultiSelect options={options} aria-label="Cities" error onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('stays quiet in error when a helperText is supplied', () => {
    render(
      <UiMultiSelect
        options={options}
        aria-label="Cities"
        error
        helperText="Required"
        onChange={noop}
      />
    );
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('warns in error when helperText is blank whitespace', () => {
    render(
      <UiMultiSelect options={options} aria-label="Cities" error helperText="   " onChange={noop} />
    );
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('stays quiet in error when helperText is a non-text node', () => {
    render(
      <UiMultiSelect
        options={options}
        aria-label="Cities"
        error
        helperText={<span>Pick a city</span>}
        onChange={noop}
      />
    );
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('emits no warnings in production even without a name', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(<UiMultiSelect options={options} onChange={noop} />);
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('re-logs the name warning when the name is removed on re-render', () => {
    const { rerender } = render(
      <UiMultiSelect options={options} aria-label="Cities" onChange={noop} />
    );
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
    rerender(<UiMultiSelect options={options} onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });
});
