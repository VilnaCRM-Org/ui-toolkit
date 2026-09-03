import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { LOADING_ANNOUNCE_DELAY_MS } from '@/components/field-controls/use-loading-announcement';

import UiButton from '../../src/components/ui-button';
import { busySx } from '../../src/components/ui-button/loading';
import UiMultiSelect from '../../src/components/ui-multi-select';
import type { UiMultiSelectOption } from '../../src/components/ui-multi-select/types';
import UiSearchInput from '../../src/components/ui-search-input';
import { searchLoadingAdornment } from '../../src/components/ui-search-input/loading-adornment';
import UiSelectWithSearch from '../../src/components/ui-select-with-search';
import { selectRootSx } from '../../src/components/ui-select-with-search/select-autocomplete';
import type { UiSelectWithSearchOption } from '../../src/components/ui-select-with-search/types';

const OPTIONS: UiSelectWithSearchOption[] = [
  { label: 'Kyiv', value: 'kyiv' },
  { label: 'Lviv', value: 'lviv' },
];
// Extracted so the JSX lines stay inside the 100-BYTE editorconfig budget:
// Cyrillic is two bytes a character, so a line prettier considers short enough
// can still overflow the byte check.
const COPY: string = 'Вантажимо';

const MULTI: UiMultiSelectOption[] = [
  { label: 'Kyiv', value: 'kyiv' },
  { label: 'Lviv', value: 'lviv' },
];

// The arc is aria-hidden by design, so it is only reachable with `hidden: true`.
// Its ABSENCE from the default (accessibility-tree) query is asserted separately.
function spinner(): HTMLElement | null {
  return screen.queryByRole('progressbar', { hidden: true });
}

describe('UiSearchInput loading', () => {
  it('renders no loading slot at all when the consumer never opts in', () => {
    render(<UiSearchInput aria-label="Search" />);
    expect(spinner()).toBeNull();
  });

  it('reserves the slot invisibly at loading=false so typed text cannot reflow', () => {
    render(<UiSearchInput aria-label="Search" loading={false} />);
    expect(spinner()).toBeInTheDocument();

    // Asserted on the element the builder returns rather than by reaching into
    // the DOM: the reserved slot is defined by the adornment's own `sx`.
    type Adornment = React.ReactElement<{ sx?: unknown }>;
    expect((searchLoadingAdornment(false) as Adornment).props.sx).toEqual({
      visibility: 'hidden',
    });
    expect((searchLoadingAdornment(true) as Adornment).props.sx).toBeUndefined();
    expect(searchLoadingAdornment(undefined)).toBeNull();
  });

  it('paints the arc at loading=true', () => {
    render(<UiSearchInput aria-label="Search" loading />);
    expect(spinner()).toBeInTheDocument();
    expect(spinner()).toHaveAttribute('aria-hidden', 'true');
  });

  it('speaks caller-supplied copy', () => {
    jest.useFakeTimers();
    render(<UiSearchInput aria-label="Search" loading loadingText="Шукаємо" />);
    React.act((): void => {
      jest.advanceTimersByTime(LOADING_ANNOUNCE_DELAY_MS);
    });
    expect(screen.getByRole('status')).toHaveTextContent('Шукаємо');
    jest.useRealTimers();
  });

  it('stays fully operable while loading', async () => {
    const user: ReturnType<typeof userEvent.setup> = userEvent.setup();
    render(<UiSearchInput aria-label="Search" loading />);
    const box: HTMLElement = screen.getByRole('combobox');
    // SC 2.1.1 / 3.2.2: the user is mid-word, so a fetch their own typing
    // triggered must not disable, freeze or re-focus the field.
    expect(box).toBeEnabled();
    expect(box).not.toHaveAttribute('readonly');
    expect(box).not.toHaveAttribute('aria-busy');
    await user.type(box, 'ky');
    expect(box).toHaveValue('ky');
  });
});

describe('UiSelectWithSearch loading', () => {
  it('hides the clear x only while loading, layered under the consumer sx', () => {
    const plain: unknown = selectRootSx({ options: OPTIONS, sx: { width: 10 } });
    expect(plain).toEqual({ width: 10 });

    const busy: unknown[] = selectRootSx({
      options: OPTIONS,
      loading: true,
      sx: { width: 10 },
    }) as unknown[];
    expect(busy[0]).toEqual({ '& .MuiAutocomplete-clearIndicator': { display: 'none' } });
    expect(busy[1]).toEqual({ width: 10 });
  });

  it('paints the arc in the clear slot and keeps the combobox operable', () => {
    render(<UiSelectWithSearch options={OPTIONS} aria-label="City" loading value={OPTIONS[0]} />);
    expect(spinner()).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('combobox')).toBeEnabled();
  });

  it('renders no loading slot when the consumer never opts in', () => {
    render(<UiSelectWithSearch options={OPTIONS} aria-label="City" />);
    expect(spinner()).toBeNull();
  });

  it('reserves the slot invisibly at loading=false', () => {
    render(<UiSelectWithSearch options={OPTIONS} aria-label="City" loading={false} />);
    expect(spinner()).toBeInTheDocument();
  });

  it('keeps the hide-clear rule when no consumer sx, and spreads an array one', () => {
    expect(selectRootSx({ options: OPTIONS, loading: true })).toHaveLength(2);
    const spread: unknown[] = selectRootSx({
      options: OPTIONS,
      loading: true,
      sx: [{ width: 10 }, { height: 20 }],
    }) as unknown[];
    expect(spread).toHaveLength(3);
  });

  it('speaks caller-supplied copy', () => {
    jest.useFakeTimers();
    render(<UiSelectWithSearch options={OPTIONS} aria-label="City" loading loadingText={COPY} />);
    React.act((): void => {
      jest.advanceTimersByTime(LOADING_ANNOUNCE_DELAY_MS);
    });
    expect(screen.getAllByRole('status')[0]).toHaveTextContent(COPY);
    jest.useRealTimers();
  });
});

describe('UiMultiSelect loading', () => {
  it('keeps the Figma-mandated clear-all and rings it rather than replacing it', () => {
    render(<UiMultiSelect options={MULTI} label="Role" loading value={[MULTI[0]]} />);
    // The x stays: unlike the select's MUI-stock indicator, this one is design-mandated.
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    expect(spinner()).toHaveAttribute('aria-hidden', 'true');
  });

  it('gives the busy state its own region so a chip diff cannot clobber it', () => {
    render(<UiMultiSelect options={MULTI} label="Role" loading value={[MULTI[0]]} />);
    expect(screen.getAllByRole('status')).toHaveLength(2);
  });

  it('renders no loading slot when the consumer never opts in', () => {
    render(<UiMultiSelect options={MULTI} label="Role" value={[MULTI[0]]} />);
    expect(spinner()).toBeNull();
  });

  it('reserves the ring invisibly at loading=false', () => {
    render(<UiMultiSelect options={MULTI} label="Role" loading={false} value={[MULTI[0]]} />);
    expect(spinner()).toBeInTheDocument();
  });

  it('speaks caller-supplied copy in its own region', () => {
    jest.useFakeTimers();
    render(
      <UiMultiSelect options={MULTI} label="Role" loading loadingText={COPY} value={[MULTI[0]]} />
    );
    React.act((): void => {
      jest.advanceTimersByTime(LOADING_ANNOUNCE_DELAY_MS);
    });
    expect(screen.getAllByRole('status')[1]).toHaveTextContent(COPY);
    jest.useRealTimers();
  });
});

describe('UiButton loading', () => {
  it('never goes natively disabled, so a focused button keeps focus', () => {
    const { rerender } = render(<UiButton>Save</UiButton>);
    const button: HTMLElement = screen.getByRole('button', { name: 'Save' });
    React.act((): void => button.focus());
    rerender(<UiButton loading>Save</UiButton>);
    // MUI's own loading path sets `disabled: disabled || loading`, and a focused
    // element that becomes disabled drops activeElement to <body> (SC 2.4.3).
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveFocus();
  });

  it('keeps its accessible name while busy', () => {
    render(<UiButton loading>Save</UiButton>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('swallows activation while busy but not before', async () => {
    const user: ReturnType<typeof userEvent.setup> = userEvent.setup();
    const onClick: jest.Mock = jest.fn();
    const { rerender } = render(<UiButton onClick={onClick}>Save</UiButton>);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <UiButton onClick={onClick} loading>
        Save
      </UiButton>
    );
    const button: HTMLElement = screen.getByRole('button', { name: 'Save' });
    React.act((): void => button.focus());
    // The keyboard path matters on its own: an aria-disabled button still
    // receives Enter, so the guard cannot rely on pointer-events alone.
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('passes a consumer sx through untouched when not busy', () => {
    expect(busySx(false, { width: 10 })).toEqual({ width: 10 });
    expect(busySx(false, undefined)).toBeUndefined();
    const busy: unknown[] = busySx(true, { width: 10 }) as unknown[];
    expect(busy[1]).toEqual({ width: 10 });
    expect(busySx(true, undefined)).toHaveLength(2);
    expect(busySx(true, [{ width: 10 }, { height: 20 }])).toHaveLength(3);
  });

  it('speaks caller-supplied copy from its own status region', () => {
    jest.useFakeTimers();
    render(
      <UiButton loading loadingText="Saving">
        Save
      </UiButton>
    );
    React.act((): void => {
      jest.advanceTimersByTime(LOADING_ANNOUNCE_DELAY_MS);
    });
    // A standalone button is not inside a form carrying aria-busy, so this is
    // the only channel that confirms anything happened after activation.
    expect(screen.getByRole('status')).toHaveTextContent('Saving');
    jest.useRealTimers();
  });
});
