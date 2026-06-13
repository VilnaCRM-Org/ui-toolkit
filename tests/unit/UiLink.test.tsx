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

    // UiLink appends a visually-hidden "(opens in new tab)" notice for new-tab
    // links, so the accessible name contains — but is not exactly — the text.
    expect(screen.getByRole('link', { name: new RegExp(testText) })).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  it('does not add a rel value for links that stay in the same tab', () => {
    render(<UiLink href={testUrl}>{testText}</UiLink>);

    expect(screen.getByRole('link', { name: testText })).not.toHaveAttribute('rel');
  });

  it('uses an explicit rel prop instead of computing one for same-tab links', () => {
    render(
      <UiLink href={testUrl} rel="nofollow">
        {testText}
      </UiLink>
    );

    // The caller-provided rel takes precedence over the (undefined) computed value.
    expect(screen.getByRole('link', { name: testText })).toHaveAttribute('rel', 'nofollow');
  });

  it('keeps an explicit rel prop even when the link opens in a new tab', () => {
    render(
      <UiLink href={testUrl} target="_blank" rel="nofollow">
        {testText}
      </UiLink>
    );

    // An explicit rel wins over the default 'noopener noreferrer' for new-tab links.
    expect(screen.getByRole('link', { name: new RegExp(testText) })).toHaveAttribute(
      'rel',
      'nofollow'
    );
  });

  it('omits the new-tab notice when newTabLabel is an empty string', () => {
    render(
      <UiLink href={testUrl} target="_blank" newTabLabel="">
        {testText}
      </UiLink>
    );

    // An empty newTabLabel suppresses the visually-hidden hint, so the accessible
    // name is exactly the children with no appended notice.
    const link: HTMLElement = screen.getByRole('link', { name: testText });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('span')).toBeNull();
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

  it('applies its own MuiLink theme regardless of parent theme overrides', () => {
    const parentTheme: ReturnType<typeof createTheme> = createTheme({
      components: {
        MuiLink: {
          defaultProps: {
            underline: 'none',
          },
        },
      },
    });

    render(
      <ThemeProvider theme={parentTheme}>
        <UiLink href={testUrl}>{testText}</UiLink>
      </ThemeProvider>
    );

    // UiLink wraps its own ThemeProvider, so the parent's `underline: 'none'`
    // default is not inherited; its own theme (fontWeight 700, underline) wins.
    const link: HTMLElement = screen.getByRole('link', { name: testText });
    expect(link).toHaveClass('MuiLink-root');
    expect(link).not.toHaveClass('MuiLink-underlineNone');
    expect(link).toHaveStyle({ fontWeight: '700' });
  });
});
