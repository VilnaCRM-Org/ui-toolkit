import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiCalendarMultiSelect from '../../src/components/ui-calendar-multi-select';
import UiLink from '../../src/components/ui-link';

import mockConsoleWarn from './utils/mock-console-warn';

// UiCalendarMultiSelect emits dev-only accessibility guidance via console.warn;
// silence it for the whole file and assert on the spy in the dedicated block.
const warn = mockConsoleWarn();

// A fixed month (no real "today" in it) keeps the tests deterministic.
const MONTH = '2025-09-15';
// A completed range (start 5th, end 20th) — the days between are the in-range band.
const SELECTED: string[] = ['2025-09-05', '2025-09-20'];

// The traced chevron path, written out rather than imported: an expectation that
// reads the source constant cannot detect a change to it.
const CHEVRON_RIGHT_D: string = [
  'M0.246315 9.07131C-0.0812683 8.74604 -0.082204 8.2165 0.244228 7.89007L3.47756 ',
  '4.65674L0.244229 1.42341C-0.0822029 1.09698 -0.0812676 0.567439 0.246316 0.242163C0.572266 ',
  '-0.0814923 1.09859 -0.0805625 1.4234 0.244242L5.83589 4.65674L1.42339 9.06924C1.09859 ',
  '9.39404 0.572265 9.39497 0.246315 9.07131Z',
].join('');

const noop: (value: string[]) => void = () => undefined;

// Matches a day cell by its date, tolerating the range-role name suffix (e.g.
// "5 September 2025, range start" / "…, in range" / "…, range end").
function gridcell(name: string): HTMLElement {
  const escaped: string = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return screen.getByRole('gridcell', { name: new RegExp(`^${escaped}(,|$)`) });
}

// State-matrix coverage (agents.md Step 3). Covered below: default, selected,
// disabled, error, empty, boundary (min/max), keyboard/focus and accessibility.
// - Loading — Not applicable: the calendar renders synchronously from props; it has
//   no async data source or loading state.
// - Success — Not applicable: there is no success/confirmation variant; the selected
//   state is asserted through `value` / `aria-selected`.

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

  it('renders a range grid named by the month caption, marked multiselectable', () => {
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} onChange={noop} />);
    const grid: HTMLElement = screen.getByRole('grid', { name: 'September 2025' });
    // A completed range marks both endpoints aria-selected, so the grid declares
    // aria-multiselectable to stay consistent with its selection model (WAI-ARIA).
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

  it('prefers defaultMonth over the first selected date when they are in different months', () => {
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth="2025-12-01"
        value={['2025-09-05']}
        onChange={noop}
      />
    );
    expect(screen.getByRole('grid', { name: 'December 2025' })).toBeInTheDocument();
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

  it('localises the month caption and weekday headers from the locale', () => {
    render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} locale="uk-UA" onChange={noop} />
    );
    expect(screen.getByRole('grid', { name: /вересень 2025/i })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Пн');
  });
});

describe('UiCalendarMultiSelect — range selection semantics', () => {
  it('marks the two endpoints selected and the in-range days explicitly unselected', () => {
    render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={SELECTED} onChange={noop} />
    );
    // Only the endpoints carry aria-selected; the band (e.g. 12th) does not.
    expect(gridcell('5 September 2025')).toHaveAttribute('aria-selected', 'true');
    expect(gridcell('20 September 2025')).toHaveAttribute('aria-selected', 'true');
    expect(gridcell('12 September 2025')).toHaveAttribute('aria-selected', 'false');
    expect(gridcell('3 September 2025')).toHaveAttribute('aria-selected', 'false');
  });

  it('names the endpoints and the in-range days for assistive tech', () => {
    render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={SELECTED} onChange={noop} />
    );
    expect(
      screen.getByRole('gridcell', { name: '5 September 2025, range start' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', { name: '20 September 2025, range end' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', { name: '12 September 2025, in range' })
    ).toBeInTheDocument();
  });

  it('starts a fresh range when a day is clicked with a range already complete', async () => {
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
    expect(onChange).toHaveBeenCalledWith(['2025-09-06']);
  });

  it('completes a range with a second endpoint, kept sorted', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        value={['2025-09-10']}
        onChange={onChange}
      />
    );

    await user.click(gridcell('4 September 2025'));
    expect(onChange).toHaveBeenCalledWith(['2025-09-04', '2025-09-10']);
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

  it('uses the locale for month-nav and selection announcements', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        locale="uk-UA"
        value={[]}
        onChange={noop}
      />
    );

    // Month-nav announcement is localised (stepMonth).
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('status')).toHaveTextContent(/жовтень 2025/i);

    // Selecting a day localises the range announcement too (selectDay).
    await user.click(screen.getByRole('gridcell', { name: /^5 жовтня 2025/ }));
    expect(screen.getByRole('status')).toHaveTextContent(/5 жовтня 2025/i);
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
    // Roving target seeds from the range's start (the earliest endpoint in view).
    expect(tabbable[0]).toHaveAccessibleName(/^5 September 2025/);
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

  it('jumps a whole year with Shift+PageDown and follows focus', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={SELECTED} onChange={noop} />
    );

    gridcell('5 September 2025').focus();
    // Shift plumbs through to nextFocusedDate as a 12-month step (not a 1-month one).
    await user.keyboard('{Shift>}{PageDown}{/Shift}');
    expect(screen.getByRole('grid', { name: 'September 2026' })).toBeInTheDocument();
    expect(gridcell('5 September 2026')).toHaveFocus();
  });

  it('crosses into the previous month when ArrowUp leaves the first week', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={SELECTED} onChange={noop} />
    );

    gridcell('5 September 2025').focus();
    await user.keyboard('{ArrowUp}'); // one week up from the first week crosses the boundary
    expect(screen.getByRole('grid', { name: 'August 2025' })).toBeInTheDocument();
    expect(gridcell('29 August 2025')).toHaveFocus();
  });

  it('sets a range endpoint with Enter and Space', async () => {
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

    // With a range already complete, activating the focused day starts a fresh range.
    gridcell('5 September 2025').focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(['2025-09-05']);

    // The controlled value is static, so Space repeats the payload; asserting the
    // call count proves Space is actually handled.
    await user.keyboard('[Space]');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(['2025-09-05']);
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

  it('ignores navigation keys pressed with a Ctrl/Alt/Meta modifier', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={SELECTED} onChange={noop} />
    );

    gridcell('5 September 2025').focus();
    // Ctrl+Arrow is a browser/AT shortcut — the grid must not hijack it.
    await user.keyboard('{Control>}{ArrowRight}{/Control}');
    expect(gridcell('5 September 2025')).toHaveFocus();
  });

  it('cancels a pending range with Escape, clearing the selection', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        value={['2025-09-05']}
        onChange={onChange}
      />
    );

    gridcell('5 September 2025').focus();
    await user.keyboard('{Escape}');
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('leaves a completed range untouched on Escape (nothing pending)', async () => {
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
    await user.keyboard('{Escape}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not throw when Escape cancels a pending range without an onChange handler', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={['2025-09-05']} />);
    gridcell('5 September 2025').focus();
    await user.keyboard('{Escape}');
    expect(gridcell('5 September 2025')).toBeInTheDocument();
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

  it('keeps focus on the month button after a no-op Home at a week edge', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        value={['2025-09-01']}
        onChange={noop}
      />
    );

    gridcell('1 September 2025').focus(); // Monday — already at the start of the week
    await user.keyboard('{Home}'); // resolves to the same day: a no-op move
    const next: HTMLElement = screen.getByRole('button', { name: 'Next month' });
    await user.click(next);
    // A no-op Home must not arm the roving-focus flag; otherwise this click would
    // have its focus stolen onto a day cell in the new month.
    expect(next).toHaveFocus();
    expect(screen.getByRole('grid', { name: 'October 2025' })).toBeInTheDocument();
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

  // The helper paragraph is emitted only when there IS helper text for it to carry.
  // Rendering it unguarded would leave an empty <p id="cal-helper-text"> in the tree:
  // a dangling aria-describedby target that describes the grid with nothing at all.
  it('renders no helper-text element at all when helperText is omitted', () => {
    const { rerender } = render(
      <UiCalendarMultiSelect label="Dates" id="cal" defaultMonth={MONTH} onChange={noop} />
    );
    // `#cal-helper-text` is the component's own public ARIA id, derived from the
    // `id` prop — not markup internals. The consequence is asserted alongside it:
    // with no helper paragraph there is nothing for the grid to be described BY.
    // eslint-disable-next-line testing-library/no-node-access -- the helper <p> has no role
    expect(document.querySelector('#cal-helper-text')).not.toBeInTheDocument();
    expect(screen.getByRole('grid')).not.toHaveAccessibleDescription();

    // The very same query finds the paragraph once helper text arrives, so the
    // absence above is a real absence and not a selector that never matches.
    rerender(
      <UiCalendarMultiSelect
        label="Dates"
        id="cal"
        defaultMonth={MONTH}
        helperText="Pick a date"
        onChange={noop}
      />
    );
    // eslint-disable-next-line testing-library/no-node-access -- the helper <p> has no role
    expect(document.querySelector('#cal-helper-text')).toHaveTextContent('Pick a date');
    expect(screen.getByRole('grid')).toHaveAccessibleDescription('Pick a date');
  });

  it('treats a blank id as absent so ARIA ids stay unique (no "-helper-text")', () => {
    render(
      <UiCalendarMultiSelect
        label="Dates"
        id=""
        defaultMonth={MONTH}
        helperText="Pick a date"
        onChange={noop}
      />
    );
    const describedBy: string = screen.getByRole('grid').getAttribute('aria-describedby') ?? '';
    expect(describedBy).not.toBe('');
    expect(describedBy.startsWith('-')).toBe(false);
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

  it('drops the pointer affordance on every day while the whole calendar is disabled', () => {
    // The click handler was already inert here, but the cell still advertised
    // `cursor: pointer` and painted the hover disc: `day.disabled` is per-date
    // (`isOutOfRange` only), so a calendar disabled as a WHOLE never set it. The
    // affordance now keys off the same `selectable` flag that gates `onClick`.
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        value={SELECTED}
        disabled
        onChange={noop}
      />
    );

    // An in-range, unselected day — the case `day.disabled` leaves false.
    expect(gridcell('6 September 2025')).toHaveStyle({ cursor: 'default' });
  });

  it('keeps the pointer affordance when the calendar is enabled', () => {
    render(
      <UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} value={SELECTED} onChange={noop} />
    );

    expect(gridcell('6 September 2025')).toHaveStyle({ cursor: 'pointer' });
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

    // Roving target seeds on the in-range endpoint; activating it is allowed.
    gridcell('15 September 2025').focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(['2025-09-15']);

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

  it('seeds the roving tab stop on the first enabled day, not a disabled 1st', () => {
    // minDate falls mid-month and there is no selection, so the 1st is disabled;
    // the initial tabbable cell must be the first *enabled* day, not day 1.
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        minDate="2025-09-10"
        onChange={noop}
      />
    );

    const tabbable: HTMLElement[] = screen
      .getAllByRole('gridcell')
      .filter(cell => cell.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName('10 September 2025');
    expect(tabbable[0]).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('opens on the nearest in-range month when today is outside min/max', () => {
    // No defaultMonth or value, and today is before the range, so the calendar must
    // open on minDate's month (which has selectable days), not today's empty month.
    jest.useFakeTimers().setSystemTime(new Date(2025, 0, 15)); // 15 Jan 2025
    try {
      render(
        <UiCalendarMultiSelect
          label="Dates"
          minDate="2025-09-10"
          maxDate="2025-09-25"
          onChange={noop}
        />
      );
      expect(screen.getByRole('grid', { name: 'September 2025' })).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not seed roving focus on a selected day outside min/max', () => {
    // 5 Sep is selected but before minDate — the roving seed must skip the disabled
    // selection for the first enabled day (10 Sep).
    render(
      <UiCalendarMultiSelect
        label="Dates"
        defaultMonth={MONTH}
        value={['2025-09-05']}
        minDate="2025-09-10"
        onChange={noop}
      />
    );
    const tabbable: HTMLElement[] = screen
      .getAllByRole('gridcell')
      .filter(cell => cell.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName('10 September 2025');
    expect(tabbable[0]).not.toHaveAttribute('aria-disabled', 'true');
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

  it('warns when the label is blank whitespace', () => {
    render(<UiCalendarMultiSelect label="   " defaultMonth={MONTH} onChange={noop} />);
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

// The chevrons are decorative — the enclosing IconButton carries the name — so they
// are reached by node access rather than by role.
describe('UiCalendarMultiSelect — decorative month chevrons', () => {
  function chevronOf(buttonName: string): SVGElement {
    const button: HTMLElement = screen.getByRole('button', { name: buttonName });
    // eslint-disable-next-line testing-library/no-node-access -- decorative glyph, no role
    const svg: SVGElement | null = button.querySelector('svg');
    expect(svg).not.toBeNull();
    return svg as SVGElement;
  }

  it('hides both chevrons from assistive tech and keeps them out of the tab order', () => {
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} onChange={noop} />);

    for (const name of ['Previous month', 'Next month']) {
      const svg: SVGElement = chevronOf(name);
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('focusable', 'false');
      // The 6x10 arrow centred in the 16px Figma icon frame by the viewBox offset.
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
      expect(svg).toHaveAttribute('viewBox', '-5.12 -3.18 16 16');
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
  });

  it('draws one traced path, filled with currentColor, for both directions', () => {
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} onChange={noop} />);

    for (const name of ['Previous month', 'Next month']) {
      // eslint-disable-next-line testing-library/no-node-access -- decorative glyph, no role
      const path: SVGPathElement | null = chevronOf(name).querySelector<SVGPathElement>('path');
      expect(path).not.toBeNull();
      expect(path).toHaveAttribute('d', CHEVRON_RIGHT_D);
      expect(path).toHaveAttribute('fill', 'currentColor');
      expect(path).not.toHaveAttribute('stroke');
    }
  });

  // One traced arrow serves both directions: the left chevron is the right one
  // mirrored, so the transform is the ONLY difference between them and dropping it
  // would silently point both the same way.
  it('mirrors the left chevron and leaves the right one untransformed', () => {
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} onChange={noop} />);

    expect(chevronOf('Previous month')).toHaveStyle({ transform: 'scaleX(-1)' });
    expect(chevronOf('Next month')).not.toHaveStyle({ transform: 'scaleX(-1)' });
  });
});

describe('UiCalendarMultiSelect — adjacent-month padding cells', () => {
  it('keeps them as real, unfocusable gridcells with an aria-hidden day number', () => {
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} onChange={noop} />);

    // September 2025 begins on a Monday and the grid's rows start on Monday, so the
    // FIRST row is all in-month (Sep 1-7) and carries no padding at all. The padding
    // is on the last row: September 30 is a Tuesday, so Oct 1-5 fill it out. The cells
    // are found by their aria-disabled flag rather than by position for exactly that
    // reason — which end of the grid pads depends on the month.
    const cells: HTMLElement[] = screen.getAllByRole('gridcell');
    const padding: HTMLElement[] = cells.filter(
      (cell: HTMLElement): boolean => cell.getAttribute('aria-disabled') === 'true'
    );
    expect(padding.length).toBeGreaterThan(0);

    for (const cell of padding) {
      // -1, never a positive index: a padding cell must stay out of the tab order
      // rather than jump ahead of every other control on the page.
      expect(cell).toHaveAttribute('tabindex', '-1');
      expect(cell).not.toHaveAttribute('aria-selected');
      // The faint day number is hidden, so assistive tech reads an empty cell.
      // eslint-disable-next-line testing-library/no-node-access -- decorative span, no role
      const dayNumber: Element | null = cell.querySelector('[aria-hidden="true"]');
      expect(dayNumber).not.toBeNull();
      expect(dayNumber?.textContent).toMatch(/^\d+$/);
    }
  });
});

describe('UiCalendarMultiSelect — the visible label', () => {
  it('paints an aria-hidden asterisk beside a required label', () => {
    render(<UiCalendarMultiSelect label="Dates" defaultMonth={MONTH} required onChange={noop} />);

    // The asterisk is the sighted, non-colour required cue; the accessible name
    // carries the word instead, which the required-semantics block asserts.
    expect(screen.getByText('*', { exact: false, selector: '[aria-hidden="true"]' })).toBeVisible();
    expect(screen.getByRole('group', { name: /Dates.*required/i })).toBeInTheDocument();
  });

  it('renders no visible label at all when the field is named by aria-label', () => {
    render(
      <UiCalendarMultiSelect
        aria-label="Vacation days"
        defaultMonth={MONTH}
        required
        onChange={noop}
      />
    );

    expect(screen.queryByText('*', { selector: '[aria-hidden="true"]' })).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Vacation days.*required/i })).toBeInTheDocument();
  });
});
