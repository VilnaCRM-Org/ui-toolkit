import { render, screen } from '@testing-library/react';
import React from 'react';

import { selectLoadingAdornment } from '@/components/ui-select-with-search/loading-adornment';

import { DEFAULT_LOADING_TEXT } from '../../src/components/field-controls/use-loading-announcement';
import UiSelectWithSearch from '../../src/components/ui-select-with-search';
import type { UiSelectWithSearchOption } from '../../src/components/ui-select-with-search/types';

import mockConsoleWarn from './utils/mock-console-warn';

mockConsoleWarn();

const NONE: UiSelectWithSearchOption[] = [];

type Adornment = React.ReactElement<{ sx: Record<string, unknown> }>;

describe('selectLoadingAdornment — the arc sits where the clear x does', () => {
  it('anchors the painted arc 43px in from the right edge, vertically centred', () => {
    expect((selectLoadingAdornment(true) as Adornment).props.sx).toEqual({
      position: 'absolute',
      right: '2.6875rem',
      top: '50%',
      display: 'inline-flex',
    });
  });

  it('reserves the same slot invisibly at loading=false', () => {
    expect((selectLoadingAdornment(false) as Adornment).props.sx).toEqual({
      position: 'absolute',
      right: '2.6875rem',
      top: '50%',
      display: 'inline-flex',
      visibility: 'hidden',
    });
  });
});

describe('UiSelectWithSearch — popup loading copy', () => {
  it('shows the toolkit default copy, not MUI’s, when loadingText is omitted', () => {
    render(<UiSelectWithSearch aria-label="City" options={NONE} loading open disablePortal />);
    expect(screen.getByText(DEFAULT_LOADING_TEXT)).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });

  it('shows the caller-supplied copy in the popup', () => {
    render(
      <UiSelectWithSearch
        aria-label="City"
        options={NONE}
        loading
        loadingText="Fetching cities"
        open
        disablePortal
      />
    );
    expect(screen.getByText('Fetching cities')).toBeInTheDocument();
    expect(screen.queryByText(DEFAULT_LOADING_TEXT)).not.toBeInTheDocument();
  });
});
