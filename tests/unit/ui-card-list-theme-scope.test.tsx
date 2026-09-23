import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import UiCardList from '../../src/components/ui-card-list';
import type { UiCardItemData } from '../../src/components/ui-card-list/types';
import { createUiTheme } from '../../src/utils/ui-theme';

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

describe('UiCardList card body theming', () => {
  it('paints the body text variant with no provider', () => {
    render(<UiCardList cardList={[plainCard]} />);

    expect(screen.getAllByText('Plain text')[0]).toHaveStyle({ color: 'rgb(26, 28, 30)' });
  });

  it('paints the tooltip label with the body variant colour', () => {
    render(<UiCardList cardList={[tooltipCard]} />);

    expect(screen.getAllByText('learn more')[0]).toHaveStyle({ color: 'rgb(26, 28, 30)' });
  });

  it('lets a consumer theme reach the card body', () => {
    render(
      <ThemeProvider theme={createUiTheme({ palette: { darkPrimary: { main: '#ff0000' } } })}>
        <UiCardList cardList={[plainCard]} />
      </ThemeProvider>
    );

    expect(screen.getAllByText('Plain text')[0]).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    expect(screen.getByRole('heading', { level: 3, hidden: true })).toHaveTextContent(
      'Plain title'
    );
  });
});
