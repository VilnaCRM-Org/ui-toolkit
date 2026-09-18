import { useMediaQuery } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import UiCardList from '../../src/components/ui-card-list';
import type { UiCardItemData } from '../../src/components/ui-card-list/types';

import mockConsoleWarn from './utils/mock-console-warn';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

const HIDDEN: { hidden: true } = { hidden: true };

const literalCard: UiCardItemData = {
  type: 'smallCard',
  id: 'literal',
  imageSrc: 'https://example.com/a.png',
  title: 'Note:done',
  text: 'Opens10:30',
  alt: 'Logo:v1',
};

const keyedCard: UiCardItemData = {
  type: 'smallCard',
  id: 'keyed',
  imageSrc: 'https://example.com/b.png',
  title: 'why_us.headers.header_open_source',
  text: 'why_us.texts.text_open_source',
  alt: 'why_us.alt_image.alt_open_source',
};

describe('UiCardList literal string props', () => {
  const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

  beforeEach((): void => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
  });

  afterEach((): void => {
    jest.clearAllMocks();
  });

  it('renders a no-space colon title, text and alt verbatim, never split on the namespace', () => {
    render(<UiCardList cardList={[literalCard]} />);

    expect(screen.getByRole('heading', { ...HIDDEN, name: 'Note:done' })).toBeInTheDocument();
    expect(screen.getByText('Opens10:30')).toBeInTheDocument();
    expect(screen.queryByText('30')).not.toBeInTheDocument();
    expect(screen.getByAltText('Logo:v1')).toBeInTheDocument();
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('does not resolve a $t() nesting expression inside a literal string', () => {
    render(
      <UiCardList
        cardList={[{ ...literalCard, title: 'Ready $t(footer.copyright)', text: 'Save 10%.' }]}
      />
    );

    expect(
      screen.getByRole('heading', { ...HIDDEN, name: 'Ready $t(footer.copyright)' })
    ).toBeInTheDocument();
    expect(screen.getByText('Save 10%.')).toBeInTheDocument();
    expect(screen.queryByText(/Copyright/)).not.toBeInTheDocument();
  });

  it('renders a key-shaped literal verbatim and still emits the untranslated-key warning', () => {
    render(<UiCardList cardList={[{ ...literalCard, text: 'v1.2.3' }]} />);

    expect(screen.getByText('v1.2.3')).toBeInTheDocument();
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('"v1.2.3"'));
  });

  it('still translates genuine keys in the same list', () => {
    render(<UiCardList cardList={[literalCard, keyedCard]} />);

    expect(screen.getByRole('heading', { ...HIDDEN, name: 'Open source' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { ...HIDDEN, name: 'Note:done' })).toBeInTheDocument();
    expect(screen.getByAltText('Image card of open source')).toBeInTheDocument();
    expect(screen.getByAltText('Logo:v1')).toBeInTheDocument();
  });
});
