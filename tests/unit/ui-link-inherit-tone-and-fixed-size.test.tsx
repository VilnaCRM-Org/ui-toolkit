import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { sharedPalette } from '../../src/components/ui-color-theme';
import UiLink from '../../src/components/ui-link';

import { emotionCssFor } from './utils/emotion-css';

const NAME: string = 'Forgot password';

function link(): HTMLElement {
  return screen.getByRole('link', { name: NAME });
}

describe('UiLink inherit tone', () => {
  it('takes the ambient MUI primary and adds no hover or active colour', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <UiLink href="/x" tone="inherit">
          {NAME}
        </UiLink>
      </ThemeProvider>
    );

    expect(link()).toHaveStyle({ color: 'rgb(25, 118, 210)' });
    const css: string = emotionCssFor(link());
    expect(css).not.toMatch(/:hover\s*\{(?:[^}]*;)?\s*color\s*:/);
    expect(css).not.toMatch(/:active\s*\{(?:[^}]*;)?\s*color\s*:/);
    expect(css).not.toContain(sharedPalette.primary.main);
    expect(css).toMatch(/font-weight:\s*700/);
  });

  it('lets the consumer sx colour the hover', () => {
    render(
      <UiLink href="/x" tone="inherit" sx={{ '&:hover': { color: '#123456' } }}>
        {NAME}
      </UiLink>
    );

    expect(emotionCssFor(link())).toMatch(/:hover\s*\{[^}]*color:\s*#123456/);
  });

  it('keeps the disabled ink', () => {
    render(
      <UiLink href="/x" tone="inherit" disabled>
        {NAME}
      </UiLink>
    );

    expect(link()).toHaveStyle({ color: sharedPalette.brandGray.main });
  });

  it('keeps the brand hover and active colours on the default tone', () => {
    render(<UiLink href="/x">{NAME}</UiLink>);

    const css: string = emotionCssFor(link());
    expect(css).toMatch(/:hover\s*\{(?:[^}]*;)?\s*color\s*:/);
    expect(css).toMatch(/:active\s*\{(?:[^}]*;)?\s*color\s*:/);
  });
});

describe('UiLink responsiveSize', () => {
  it('emits both font-size media rules by default', () => {
    render(<UiLink href="/x">{NAME}</UiLink>);

    const css: string = emotionCssFor(link());
    expect(css).toMatch(/@media \(max-width:\s*1130px\)/);
    expect(css).toMatch(/@media \(max-width:\s*640px\)/);
  });

  it('omits both media rules when disabled so the consumer font size wins', () => {
    render(
      <UiLink href="/x" responsiveSize={false} sx={{ fontSize: '0.875rem' }}>
        {NAME}
      </UiLink>
    );

    const css: string = emotionCssFor(link());
    expect(css).not.toContain('@media');
    expect(css).toMatch(/font-size:\s*0\.875rem/);
    expect(link()).toHaveStyle({ color: sharedPalette.primary.main });
  });

  it('combines with the inherit tone', () => {
    render(
      <UiLink href="/x" tone="inherit" responsiveSize={false}>
        {NAME}
      </UiLink>
    );

    const css: string = emotionCssFor(link());
    expect(css).not.toContain('@media');
    expect(css).not.toMatch(/:hover\s*\{(?:[^}]*;)?\s*color\s*:/);
  });
});
