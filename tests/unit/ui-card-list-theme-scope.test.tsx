import { Theme } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import React from 'react';

import UiCardList from '../../src/components/ui-card-list';
import type { UiCardItemData } from '../../src/components/ui-card-list/types';
import tooltipTheme from '../../src/components/ui-tooltip/theme';
import { typographyTheme } from '../../src/components/ui-typography';

// Count every ThemeProvider the toolkit itself mounts. Components reach for it
// through the '@mui/material' barrel, so patching the barrel counts them while
// leaving the provider's real behaviour (and this file's own outer provider,
// imported from '@mui/material/styles') untouched.
const mockThemeProvider: jest.Mock = jest.fn();

jest.mock('@mui/material', () => {
  const actual: typeof import('@mui/material') = jest.requireActual('@mui/material');
  const mockReact: typeof import('react') = jest.requireActual('react');

  return {
    __esModule: true,
    ...actual,
    ThemeProvider: (
      props: React.ComponentProps<typeof actual.ThemeProvider>
    ): React.ReactElement => {
      mockThemeProvider(props.theme);
      return mockReact.createElement(actual.ThemeProvider, props);
    },
  };
});

const plainCard: UiCardItemData = {
  type: 'smallCard',
  id: 'plain-card',
  imageSrc: 'https://example.com/plain.png',
  title: 'Plain title',
  text: 'Plain text',
  alt: 'Plain alt',
};
const tooltipCard: UiCardItemData = {
  ...plainCard,
  id: 'tooltip-card',
  tooltipTitle: 'Helpful explanation',
  tooltipLabel: 'learn more',
};

function providersFor(theme: Theme): number {
  return mockThemeProvider.mock.calls.filter(([mounted]) => mounted === theme).length;
}

describe('UiCardList theme scoping', () => {
  it('mounts a single typography provider for a card body', () => {
    render(<UiCardList cardList={[plainCard]} />);

    // The card title and body text are two UiTypography instances; the hoisted
    // scope in CardContent is the only provider the three of them mount.
    expect(providersFor(typographyTheme)).toBe(1);
  });

  it('mounts no typography provider when an ancestor already applies that theme', () => {
    render(
      <ThemeProvider theme={typographyTheme}>
        <UiCardList cardList={[plainCard]} />
      </ThemeProvider>
    );

    expect(providersFor(typographyTheme)).toBe(0);
    // Both variant wrappers carry a media-query `display: none` that jsdom
    // cannot evaluate, so role queries have to opt into hidden elements.
    expect(screen.getByRole('heading', { level: 3, hidden: true })).toHaveTextContent(
      'Plain title'
    );
  });

  it('keeps the tooltip provider and the provider the tooltip label needs', () => {
    render(
      <ThemeProvider theme={typographyTheme}>
        <UiCardList cardList={[tooltipCard]} />
      </ThemeProvider>
    );

    // MUI merges themes by shallow spread, so the tooltip theme replaces the
    // whole `typography` slot. Neither of these providers is redundant: the
    // tooltip's carries its own styling, and the one inside it restores the
    // typography variants the tooltip theme wiped out for the label.
    expect(providersFor(tooltipTheme)).toBe(1);
    expect(providersFor(typographyTheme)).toBe(1);
  });

  it('renders the tooltip label against the typography theme, not the trigger', () => {
    render(<UiCardList cardList={[tooltipCard]} />);

    // Guards the label's own scope: without it the text would inherit the
    // trigger's link colour instead of the body colour it is styled with.
    expect(screen.getByText('learn more')).toHaveStyle({ color: 'rgb(26, 28, 30)' });
  });
});
