import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { UiLink } from '../../src/components';

import { testText, testUrl } from './constants';

describe('UiLink', () => {
  it('renders the Link with the provided children and href', () => {
    const testHref: string = testUrl;
    const { getByText } = render(<UiLink href={testHref}>{testText}</UiLink>);
    const linkElement: HTMLElement = getByText(testText);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', testHref);
  });

  it('adds a safe rel value for links that open in a new tab', () => {
    render(
      <UiLink href={testUrl} target="_blank">
        {testText}
      </UiLink>
    );

    expect(screen.getByRole('link', { name: testText })).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  it('does not add a rel value for links that stay in the same tab', () => {
    render(<UiLink href={testUrl}>{testText}</UiLink>);

    expect(screen.getByRole('link', { name: testText })).not.toHaveAttribute('rel');
  });

  it('applies base link styles when custom sx is not provided', () => {
    render(<UiLink href={testUrl}>{testText}</UiLink>);

    expect(screen.getByRole('link', { name: testText })).toHaveStyle({
      fontWeight: '700',
    });
  });

  it('merges base link styles with object sx props', () => {
    render(
      <UiLink href={testUrl} sx={{ textTransform: 'uppercase' }}>
        {testText}
      </UiLink>
    );

    expect(screen.getByRole('link', { name: testText })).toHaveStyle({
      fontWeight: '700',
      textTransform: 'uppercase',
    });
  });

  it('merges base link styles with array sx props', () => {
    render(
      <UiLink href={testUrl} sx={[{ letterSpacing: '0.125rem' }]}>
        {testText}
      </UiLink>
    );

    expect(screen.getByRole('link', { name: testText })).toHaveStyle({
      fontWeight: '700',
      letterSpacing: '0.125rem',
    });
  });

  it('inherits parent MuiLink theme defaults', () => {
    const theme: ReturnType<typeof createTheme> = createTheme({
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
