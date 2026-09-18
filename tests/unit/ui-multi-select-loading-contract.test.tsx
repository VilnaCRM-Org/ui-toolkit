import { render, screen } from '@testing-library/react';
import React from 'react';

import { multiSelectLoadingAdornment } from '@/components/ui-multi-select/loading-adornment';

import { DEFAULT_LOADING_TEXT } from '../../src/components/field-controls/use-loading-announcement';
import UiMultiSelect from '../../src/components/ui-multi-select';
import { multiSelectRootSx } from '../../src/components/ui-multi-select/combobox';
import type { UiMultiSelectOption } from '../../src/components/ui-multi-select/types';

import mockConsoleWarn from './utils/mock-console-warn';

mockConsoleWarn();

const OPTIONS: [UiMultiSelectOption, UiMultiSelectOption] = [
  { label: 'Kyiv', value: 'kyiv' },
  { label: 'Lviv', value: 'lviv' },
];
const NONE: UiMultiSelectOption[] = [];
const HIDE_CLEAR: Record<string, unknown> = {
  '& .MuiAutocomplete-clearIndicator': { display: 'none' },
};

type Adornment = React.ReactElement<{ sx: Record<string, unknown> }>;

describe('multiSelectRootSx — untouched fields pass the consumer sx through by identity', () => {
  it('returns the very consumer sx object when nothing is derived', () => {
    const sx: Record<string, unknown> = { width: 10 };
    expect(multiSelectRootSx({ options: OPTIONS, sx })).toBe(sx);
    expect(multiSelectRootSx({ options: OPTIONS, value: NONE, loading: false, sx })).toBe(sx);
  });

  it('returns a plain empty object when there is no consumer sx and nothing derived', () => {
    expect(multiSelectRootSx({ options: OPTIONS })).toEqual({});
    expect(Array.isArray(multiSelectRootSx({ options: OPTIONS, loading: false }))).toBe(false);
  });

  it('hides the clear-all only when loading is exactly true', () => {
    expect(multiSelectRootSx({ options: OPTIONS, value: [OPTIONS[0]] })).not.toContainEqual(
      HIDE_CLEAR
    );
    expect(
      multiSelectRootSx({ options: OPTIONS, value: [OPTIONS[0]], loading: false })
    ).not.toContainEqual(HIDE_CLEAR);
    expect(multiSelectRootSx({ options: OPTIONS, loading: true })).toContainEqual(HIDE_CLEAR);
  });
});

describe('multiSelectLoadingAdornment — the arc sits on the clear-all slot', () => {
  it('anchors the painted arc 50px in from the right edge, on the indicator row', () => {
    expect((multiSelectLoadingAdornment(true) as Adornment).props.sx).toEqual({
      position: 'absolute',
      right: '3.125rem',
      top: '1.375rem',
      display: 'inline-flex',
    });
  });

  it('reserves the same slot invisibly at loading=false', () => {
    expect((multiSelectLoadingAdornment(false) as Adornment).props.sx).toEqual({
      position: 'absolute',
      right: '3.125rem',
      top: '1.375rem',
      display: 'inline-flex',
      visibility: 'hidden',
    });
  });
});

describe('UiMultiSelect — popup loading copy', () => {
  it('shows the toolkit default copy, not MUI’s, when loadingText is omitted', () => {
    render(<UiMultiSelect aria-label="Roles" options={NONE} loading open disablePortal />);
    expect(screen.getByText(DEFAULT_LOADING_TEXT)).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });

  it('shows the caller-supplied copy in the popup', () => {
    render(
      <UiMultiSelect
        aria-label="Roles"
        options={NONE}
        loading
        loadingText="Fetching roles"
        open
        disablePortal
      />
    );
    expect(screen.getByText('Fetching roles')).toBeInTheDocument();
    expect(screen.queryByText(DEFAULT_LOADING_TEXT)).not.toBeInTheDocument();
  });
});
