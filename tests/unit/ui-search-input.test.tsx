import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiLink from '../../src/components/ui-link';
import UiSearchInput from '../../src/components/ui-search-input';

import mockConsoleWarn from './utils/mock-console-warn';

// UiSearchInput emits dev-only accessible-name guidance via console.warn; silence
// it for the whole file and let the dedicated block assert on the spy.
const warn = mockConsoleWarn();

// The traced magnifier path, written out rather than imported: an expectation
// that reads the source constant cannot detect a change to it.
const MAGNIFIER_D: string = [
  'M16.4424 15.2591L13.3507 12.1924C14.5508 10.6961 15.132 8.79683 14.9748 6.88517C14.8175 ',
  '4.9735 13.9338 3.19474 12.5054 1.91462C11.0769 0.634506 9.21226 -0.0496579 7.29485 ',
  '0.00280914C5.37745 0.0552761 3.55302 0.840385 2.1967 2.1967C0.840385 3.55302 0.0552761 ',
  '5.37745 0.00280914 7.29485C-0.0496579 9.21226 0.634505 11.0769 1.91462 12.5054C3.19474 ',
  '13.9338 4.9735 14.8175 6.88517 14.9748C8.79683 15.132 10.6961 14.5508 12.1924 ',
  '13.3508L15.2591 16.4174C15.3366 16.4955 15.4287 16.5575 15.5303 16.5998C15.6318 16.6421 ',
  '15.7407 16.6639 15.8507 16.6639C15.9608 16.6639 16.0697 16.6421 16.1712 16.5998C16.2728 ',
  '16.5575 16.3649 16.4955 16.4424 16.4174C16.5926 16.262 16.6766 16.0544 16.6766 ',
  '15.8383C16.6766 15.6221 16.5926 15.4145 16.4424 15.2591ZM7.51742 13.3508C6.36369 13.3508 ',
  '5.23588 13.0086 4.27659 12.3677C3.3173 11.7267 2.56963 10.8156 2.12812 9.74974C1.68661 ',
  '8.68384 1.57109 7.51095 1.79617 6.37939C2.02125 5.24784 2.57682 4.20843 3.39263 ',
  '3.39263C4.20843 2.57682 5.24783 2.02125 6.37939 1.79617C7.51095 1.57109 8.68384 1.68661 ',
  '9.74974 2.12812C10.8156 2.56963 11.7267 3.3173 12.3677 4.27659C13.0086 5.23588 13.3507 ',
  '6.36369 13.3507 7.51742C13.3507 9.06451 12.7362 10.5482 11.6422 11.6422C10.5482 12.7362 ',
  '9.06451 13.3508 7.51742 13.3508Z',
].join('');

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

  it('merges a consumer array sx onto the field wrapper, not the inner input', () => {
    render(<UiSearchInput aria-label="Search" sx={[{ marginTop: '11px' }]} />);
    const combobox: HTMLElement = screen.getByRole('combobox');
    // The consumer sx lands on the wrapping flex-column Box (parent of the Autocomplete
    // root) so the label + field move together; assert the merged sx reaches the DOM.
    /* eslint-disable testing-library/no-node-access -- wrapper Box, no semantic query */
    const wrapper: HTMLElement | null | undefined =
      combobox.closest('.MuiAutocomplete-root')?.parentElement;
    /* eslint-enable testing-library/no-node-access */
    expect(wrapper).toHaveStyle({ marginTop: '11px' });
  });

  it('merges a consumer object sx onto the same wrapper as an array sx', () => {
    render(<UiSearchInput aria-label="Search" sx={{ marginTop: '13px' }} />);
    const combobox: HTMLElement = screen.getByRole('combobox');
    // A bare object takes the other branch of the sx merge, so it needs its own case:
    // the wrapper must keep the flex-column stack AND still pick the consumer value up.
    /* eslint-disable testing-library/no-node-access -- wrapper Box, no semantic query */
    const wrapper: HTMLElement | null | undefined =
      combobox.closest('.MuiAutocomplete-root')?.parentElement;
    /* eslint-enable testing-library/no-node-access */
    expect(wrapper).toHaveStyle({ display: 'flex', flexDirection: 'column' });
    expect(wrapper).toHaveStyle({ marginTop: '13px' });
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
    expect(combobox).toHaveAttribute('aria-activedescendant', renderedOptions[0]!.id);
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

  it('force-opens the suggestions dropdown inline (demo props)', () => {
    render(
      <UiSearchInput aria-label="Search" options={suggestions} value="Top" open disablePortal />
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('names the force-opened listbox from the field label', () => {
    render(<UiSearchInput label="Find" options={suggestions} value="Top" open disablePortal />);
    // Force-open swaps in a second slotProps object (it also pins the popper); the
    // listbox aria-label has to survive that swap, not just the typed-open path.
    expect(screen.getByRole('listbox')).toHaveAccessibleName('Find');
  });
});

describe('UiSearchInput — suggestion highlighting', () => {
  it('splits a matching suggestion into a dark typed prefix and a grey completion', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledSearch options={suggestions} />);
    await user.type(screen.getByRole('combobox'), 'Top perf');
    /* eslint-disable testing-library/no-node-access, jest-dom/prefer-to-have-text-content */
    const runs: NodeListOf<HTMLSpanElement> = (
      await screen.findByRole('option', { name: 'Top performers' })
    ).querySelectorAll('span');
    expect(runs).toHaveLength(2);
    expect(runs[0]!.textContent).toBe('Top perf');
    expect(runs[1]!.textContent).toBe('ormers');
    /* eslint-enable testing-library/no-node-access, jest-dom/prefer-to-have-text-content */
  });

  it('renders a non-prefix match fully in the dark run', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledSearch options={suggestions} />);
    await user.type(screen.getByRole('combobox'), 'sales');
    /* eslint-disable testing-library/no-node-access, jest-dom/prefer-to-have-text-content */
    const runs: NodeListOf<HTMLSpanElement> = (
      await screen.findByRole('option', { name: 'Top sales this month' })
    ).querySelectorAll('span');
    expect(runs[0]!.textContent).toBe('Top sales this month');
    expect(runs[1]!.textContent).toBe('');
    /* eslint-enable testing-library/no-node-access, jest-dom/prefer-to-have-text-content */
  });

  it('renders a suggestion fully dark before anything is typed', () => {
    render(<UiSearchInput aria-label="Search" options={suggestions} value="" open disablePortal />);
    /* eslint-disable testing-library/no-node-access, jest-dom/prefer-to-have-text-content */
    const runs: NodeListOf<HTMLSpanElement> = screen
      .getByRole('option', { name: 'Top performers' })
      .querySelectorAll('span');
    expect(runs[0]!.textContent).toBe('Top performers');
    expect(runs[1]!.textContent).toBe('');
    /* eslint-enable testing-library/no-node-access, jest-dom/prefer-to-have-text-content */
  });
});

// The magnifier is decorative — no role, no accessible name — so it is reached by
// node access, the same way the other glyph suites reach theirs.
describe('UiSearchInput — decorative magnifier glyph', () => {
  it('draws the filled magnifier, hidden from assistive tech and never focusable', () => {
    render(<ControlledSearch />);

    // eslint-disable-next-line testing-library/no-node-access -- decorative glyph, no role
    const svg: SVGElement | null = document.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    // The 17px glyph centred in the 20px icon box by the viewBox offset; the 20px
    // box is what keeps the theme's responsive svg sizing (24px tablet) working.
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(svg).toHaveAttribute('viewBox', '-1.5 -1.5 20 20');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
  });

  it('pins the whole traced path and fills it with currentColor', () => {
    render(<ControlledSearch />);

    // eslint-disable-next-line testing-library/no-node-access -- decorative glyph, no role
    const path: SVGPathElement | null = document.querySelector<SVGPathElement>('svg path');
    expect(path).not.toBeNull();
    expect(path).toHaveAttribute('d', MAGNIFIER_D);
    // FILLED, not stroked: `currentColor` is what lets the theme tint it grey at
    // rest and brand-blue on hover/focus.
    expect(path).toHaveAttribute('fill', 'currentColor');
    expect(path).not.toHaveAttribute('stroke');
  });
});
