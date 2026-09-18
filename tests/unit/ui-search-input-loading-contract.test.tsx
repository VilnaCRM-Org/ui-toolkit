import { render, screen } from '@testing-library/react';
import React from 'react';

import { DEFAULT_LOADING_TEXT } from '../../src/components/field-controls/use-loading-announcement';
import UiSearchInput from '../../src/components/ui-search-input';

import mockConsoleWarn from './utils/mock-console-warn';

mockConsoleWarn();

describe('UiSearchInput — popup loading copy', () => {
  it('shows the toolkit default copy, not MUI’s, when loadingText is omitted', () => {
    render(<UiSearchInput aria-label="Search" loading open disablePortal />);
    expect(screen.getByText(DEFAULT_LOADING_TEXT)).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });

  it('shows the caller-supplied copy in the popup', () => {
    render(
      <UiSearchInput aria-label="Search" loading loadingText="Searching" open disablePortal />
    );
    expect(screen.getByText('Searching')).toBeInTheDocument();
    expect(screen.queryByText(DEFAULT_LOADING_TEXT)).not.toBeInTheDocument();
  });
});
