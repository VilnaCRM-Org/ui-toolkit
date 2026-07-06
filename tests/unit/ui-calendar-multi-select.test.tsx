import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiCalendarMultiSelect, UiLink } from '../../src/components';

import mockConsoleWarn from './utils/mock-console-warn';

// UiCalendarMultiSelect emits dev-only accessibility guidance via console.warn;
// silence it for the whole file and assert on the spy in the dedicated block.
const warn = mockConsoleWarn();

// A fixed month (no real "today" in it) keeps the tests deterministic.
const MONTH = '2025-09-15';
const SELECTED: string[] = ['2025-09-05', '2025-09-12', '2025-09-20'];

const noop: (value: string[]) => void = () => undefined;

function gridcell(name: string): HTMLElement {
  return screen.getByRole('gridcell', { name });
}

describe('UiCalendarMultiSelect — structure and accessible names', () => {
  it('renders a group named by a visible label', () => {
    render(<UiCalendarMultiSelect label="Available dates" defaultMonth={MONTH} onChange={noop} />);
    expect(screen.getByRole('group', { name: 'Available dates' })).toBeInTheDocument();
  });

  it('names the group from aria-label when there is no visible label', () => {
    render(
      <UiCalendarMultiSelect aria-label="Choose dates" defaultMonth={MONTH} onChange={noop} />
    );
    expect(screen.getByRole('group', { name: 'Choose dates' })).toBeInTheDocument();
  });

  it('prefers the visible label over aria-label', () => {
    render(
      <UiCalendarMultiSelect
        label="Available dates"
        aria-label="Ignored"
        defaultMonth={MONTH}
        onChange={noop}
      />
    );
    expect(screen.getByRole('group', { name: 'Available dates' })).toBeInTheDocument();
  });

  it('falls back to aria-label when the label is empty', () => {
    render(
      <UiCalendarMultiSelect
        label=""
        aria-label="Choose dates"
        defaultMonth={MONTH}
        onChange={noop}
      />
    );
    expect(screen.getByRole('group', { name: 'Choose dates' })).toBeInTheDocument();
  });

  it('exposes its display name', () => {
    expect(UiCalendarMultiSelect.displayName).toBe('UiCalendarMultiSelect');
  });

  it('renders a multiselectable grid named by the month caption', () => {
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} onChange={noop} />);
    const grid: HTMLElement = screen.getByRole('grid', { name: 'September 2025' });
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    // No helper text → the grid is not described by anything.
    expect(grid).not.toHaveAttribute('aria-describedby');
    // Enabled by default: neither the field nor the grid is marked disabled.
    expect(screen.getByRole('group')).not.toHaveAttribute('aria-disabled');
    expect(grid).not.toHaveAttribute('aria-disabled');
  });

  it('seeds the visible month from the first selected date when no defaultMonth is given', () => {
    render(<UiCalendarMultiSelect label="Dates" value={['2025-08-10']} onChange={noop} />);
    expect(screen.getByRole('grid', { name: 'August 2025' })).toBeInTheDocument();
  });

  it('renders Monday-first weekday column headers with full names', () => {
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} onChange={noop} />);
    const headers: HTMLElement[] = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(7);
    expect(headers[0]).toHaveAccessibleName('Monday');
    expect(headers[6]).toHaveAccessibleName('Sunday');
    expect(headers[0]).toHaveTextContent('Mon');
  });

  it('labels day cells with the full date', () => {
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} onChange={noop} />);
    expect(gridcell('1 September 2025')).toBeInTheDocument();
    expect(gridcell('30 September 2025')).toBeInTheDocument();
  });
});

describe('UiCalendarMultiSelect — selection semantics', () => {
  it('marks selected days and leaves other in-month days explicitly unselected', () => {
    render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={SELECTED} onChange={noop} />
    );
    expect(gridcell('5 September 2025')).toHaveAttribute('aria-selected', 'true');
    expect(gridcell('12 September 2025')).toHaveAttribute('aria-selected', 'true');
    expect(gridcell('6 September 2025')).toHaveAttribute('aria-selected', 'false');
  });

  it('adds an unselected day through onChange, keeping the result sorted', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        value={SELECTED}
        onChange={onChange}
      />
    );

    await user.click(gridcell('6 September 2025'));
    expect(onChange).toHaveBeenCalledWith(['2025-09-05', '2025-09-06', '2025-09-12', '2025-09-20']);
  });

  it('removes an already-selected day through onChange', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        value={SELECTED}
        onChange={onChange}
      />
    );

    await user.click(gridcell('5 September 2025'));
    expect(onChange).toHaveBeenCalledWith(['2025-09-12', '2025-09-20']);
  });

  it('does not throw when a day is clicked without an onChange handler', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={SELECTED} />);
    await user.click(gridcell('6 September 2025'));
    expect(gridcell('6 September 2025')).toBeInTheDocument();
  });

  it('reflects a controlled value change', () => {
    const { rerender } = render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={[]} onChange={noop} />
    );
    expect(gridcell('5 September 2025')).toHaveAttribute('aria-selected', 'false');

    rerender(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        value={['2025-09-05']}
        onChange={noop}
      />
    );
    expect(gridcell('5 September 2025')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('UiCalendarMultiSelect — roving tabindex and keyboard navigation', () => {
  it('exposes exactly one tabbable day (the roving target)', () => {
    render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={SELECTED} onChange={noop} />
    );
    const tabbable: HTMLElement[] = screen
      .getAllByRole('gridcell')
      .filter(cell => cell.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    // Roving target seeds from the earliest selected day in view.
    expect(tabbable[0]).toHaveAccessibleName('5 September 2025');
  });

  it('moves focus by a day and by a week with arrow keys', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={SELECTED} onChange={noop} />
    );

    gridcell('5 September 2025').focus();
    await user.keyboard('{ArrowRight}');
    expect(gridcell('6 September 2025')).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(gridcell('13 September 2025')).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    await user.keyboard('{ArrowLeft}');
    expect(gridcell('5 September 2025')).toHaveFocus();
  });

  it('jumps to the week edges with Home/End', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={SELECTED} onChange={noop} />
    );

    gridcell('5 September 2025').focus(); // Friday
    await user.keyboard('{Home}');
    expect(gridcell('1 September 2025')).toHaveFocus(); // Monday
    await user.keyboard('{End}');
    expect(gridcell('7 September 2025')).toHaveFocus(); // Sunday
  });

  it('changes month with PageDown and follows focus into the new month', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={SELECTED} onChange={noop} />
    );

    gridcell('5 September 2025').focus();
    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid', { name: 'October 2025' })).toBeInTheDocument();
    expect(gridcell('5 October 2025')).toHaveFocus();
  });

  it('toggles the focused day with Enter and Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        value={SELECTED}
        onChange={onChange}
      />
    );

    gridcell('5 September 2025').focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['2025-09-12', '2025-09-20']);

    await user.keyboard('[Space]');
    expect(onChange).toHaveBeenLastCalledWith(['2025-09-12', '2025-09-20']);
  });

  it('does not react to unrelated keys', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        value={SELECTED}
        onChange={onChange}
      />
    );

    gridcell('5 September 2025').focus();
    await user.keyboard('a');
    expect(gridcell('5 September 2025')).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('UiCalendarMultiSelect — month navigation buttons', () => {
  it('names the previous/next buttons', () => {
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} onChange={noop} />);
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument();
  });

  it('advances the month, announces it politely, and keeps focus on the button', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} onChange={noop} />);

    const next: HTMLElement = screen.getByRole('button', { name: 'Next month' });
    await user.click(next);

    expect(screen.getByRole('grid', { name: 'October 2025' })).toBeInTheDocument();
    expect(next).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('October 2025');
  });

  it('goes to the previous month', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} onChange={noop} />);
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByRole('grid', { name: 'August 2025' })).toBeInTheDocument();
  });

  it('keeps the announcer silent for keyboard month changes', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={SELECTED} onChange={noop} />
    );

    gridcell('5 September 2025').focus();
    await user.keyboard('{PageDown}');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});

describe('UiCalendarMultiSelect — today marker', () => {
  it('marks the current day with aria-current', () => {
    jest.useFakeTimers().setSystemTime(new Date(2025, 8, 15));
    try {
      render(<UiCalendarMultiSelect label="Dates" onChange={noop} />);
      expect(gridcell('15 September 2025')).toHaveAttribute('aria-current', 'date');
      expect(gridcell('16 September 2025')).not.toHaveAttribute('aria-current');
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('UiCalendarMultiSelect — error, helper and required semantics', () => {
  it('describes the grid with the helper text and announces the error via an alert region', () => {
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        error
        helperText="Pick at least one date"
        onChange={noop}
      />
    );
    expect(screen.getByRole('grid')).toHaveAccessibleDescription('Pick at least one date');
    expect(screen.getByRole('alert')).toHaveTextContent('Pick at least one date');
  });

  it('links a non-error helper as a description without raising an alert', () => {
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        helperText="Choose your availability"
        onChange={noop}
      />
    );
    expect(screen.getByRole('grid')).toHaveAccessibleDescription('Choose your availability');
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it('folds the required state into a visible-label accessible name', () => {
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} required onChange={noop} />);
    expect(screen.getByRole('group', { name: /Dates.*required/i })).toBeInTheDocument();
  });

  it('folds the required state into the aria-label when there is no visible label', () => {
    render(
      <UiCalendarMultiSelect
        aria-label="Vacation days"
        defaultMonth={MONTH}
        required
        onChange={noop}
      />
    );
    expect(screen.getByRole('group', { name: /Vacation days.*required/i })).toBeInTheDocument();
  });
});

describe('UiCalendarMultiSelect — disabled semantics', () => {
  it('disables the whole calendar and removes days from the tab order', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        value={SELECTED}
        disabled
        onChange={onChange}
      />
    );

    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
    expect(gridcell('5 September 2025')).toHaveAttribute('tabindex', '-1');

    await user.click(gridcell('6 September 2025'));
    expect(onChange).not.toHaveBeenCalled();

    // Keyboard events on a disabled calendar are ignored (focus does not move).
    const roving: HTMLElement = gridcell('5 September 2025');
    roving.focus();
    await user.keyboard('{ArrowRight}');
    expect(roving).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('suppresses the error state while disabled', () => {
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        error
        disabled
        helperText="Ignored while disabled"
        onChange={noop}
      />
    );
    // Disabled wins: the error is suppressed, so the alert region stays empty.
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });
});

describe('UiCalendarMultiSelect — min/max range', () => {
  function renderRange(onChange: (value: string[]) => void): void {
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        value={['2025-09-15']}
        minDate="2025-09-10"
        maxDate="2025-09-20"
        onChange={onChange}
      />
    );
  }

  it('marks out-of-range days disabled and blocks pointer selection', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    renderRange(onChange);

    const belowMin: HTMLElement = gridcell('5 September 2025');
    expect(belowMin).toHaveAttribute('aria-disabled', 'true');
    expect(belowMin).not.toHaveAttribute('aria-selected');
    expect(gridcell('25 September 2025')).toHaveAttribute('aria-disabled', 'true');
    expect(gridcell('10 September 2025')).not.toHaveAttribute('aria-disabled');

    await user.click(belowMin);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('allows keyboard selection inside the range but not outside it', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    renderRange(onChange);

    // Roving target seeds on the in-range selected day; toggling it works.
    gridcell('15 September 2025').focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith([]);

    // Navigate up a week to a day below the min — Enter is a no-op there.
    await user.keyboard('{ArrowUp}');
    expect(gridcell('8 September 2025')).toHaveFocus();
    await user.keyboard('{Enter}');

    // Navigate down two weeks to a day above the max — also a no-op.
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(gridcell('22 September 2025')).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('UiCalendarMultiSelect — prop plumbing', () => {
  it('accepts the small size and a consumer sx array without breaking', () => {
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        size="small"
        sx={[{ marginTop: '1rem' }]}
        onChange={noop}
      />
    );
    expect(screen.getByRole('group', { name: 'Dates' })).toBeInTheDocument();
  });

  it('does not trap keyboard focus — the grid is a single tab stop', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <>
        <UiCalendarMultiSelect
          label="Dates"
          defaultMonth={MONTH}
          value={SELECTED}
          onChange={noop}
        />
        <UiLink href="/after">after</UiLink>
      </>
    );

    const roving: HTMLElement = gridcell('5 September 2025');
    roving.focus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'after' })).toHaveFocus();
  });
});

describe('UiCalendarMultiSelect — accessibility guidance', () => {
  it('warns when there is no accessible name', () => {
    render(<UiCalendarMultiSelect defaultMonth={MONTH} onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
  });

  it('stays quiet when a label or aria-label is provided', () => {
    const { rerender } = render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} onChange={noop} />
    );
    rerender(<UiCalendarMultiSelect aria-label="Dates" defaultMonth={MONTH} onChange={noop} />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('warns when only an id is given (an id does not name the group)', () => {
    render(<UiCalendarMultiSelect id="cal" defaultMonth={MONTH} onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('warns when in error with no helperText', () => {
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} error onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('stays quiet in error when a helperText is supplied', () => {
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
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
      render(<UiCalendarMultiSelect defaultMonth={MONTH} onChange={noop} />);
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('re-logs the name warning when the name is removed on re-render', () => {
    const { rerender } = render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} onChange={noop} />
    );
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
    rerender(<UiCalendarMultiSelect defaultMonth={MONTH} onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });
});
