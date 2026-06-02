import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { UiLink } from '../../components';

import { testText, testUrl } from './constants';

describe('UiLink', () => {
  it('renders the Link with the provided children and href', () => {
    const testHref: string = testUrl;
    const { getByText } = render(<UiLink href={testHref}>{testText}</UiLink>);
    const linkElement: HTMLElement = getByText(testText);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', testHref);
  });

  it('inherits parent MuiLink theme defaults', () => {
    const theme = createTheme({
      components: {
        MuiLink: {
          defaultProps: {
            underline: 'none',
          },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <UiLink href={testUrl}>{testText}</UiLink>
      </ThemeProvider>
    );

    expect(screen.getByRole('link', { name: testText })).toHaveClass(
      'MuiLink-root',
      'MuiLink-underlineNone'
    );
  });
});
