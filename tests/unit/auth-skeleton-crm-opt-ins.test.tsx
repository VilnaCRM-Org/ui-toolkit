import { createTheme, ThemeProvider, type Theme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import AuthSkeleton from '../../src/components/auth-skeleton';
import UiThemeProvider from '../../src/components/ui-theme-provider';

import { emotionCssFor } from './utils/emotion-css';

const appTheme: Theme = createTheme({ palette: { primary: { main: '#1EAEFF' } } });

function busyContainer(container: HTMLElement): HTMLElement {
  return container.querySelector('[aria-busy="true"]') as HTMLElement;
}

function card(container: HTMLElement): HTMLElement {
  return container.querySelector('[aria-hidden="true"] > div') as HTMLElement;
}

function fieldRow(): HTMLElement {
  return document.getElementById('auth-skeleton-field-label-1')?.parentElement as HTMLElement;
}

describe('AuthSkeleton landmark opt-in', () => {
  it('renders a named busy section without the hidden text', () => {
    const { container } = render(<AuthSkeleton landmark="section" ariaLabel="Loading sign-in" />);
    const region: HTMLElement = screen.getByRole('region', { name: 'Loading sign-in' });
    expect(region.tagName).toBe('SECTION');
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region).toHaveAttribute('aria-label', 'Loading sign-in');
    expect(busyContainer(container)).toBe(region);
    expect(screen.queryByText('Loading sign-in')).not.toBeInTheDocument();
  });

  it('keeps the nameless div with the hidden text by default', () => {
    const { container } = render(<AuthSkeleton ariaLabel="Loading sign-in" />);
    const busy: HTMLElement = busyContainer(container);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(busy.tagName).toBe('DIV');
    expect(busy).not.toHaveAttribute('aria-label');
    expect(screen.getByText('Loading sign-in').tagName).toBe('SPAN');
    expect(busy).toHaveTextContent(/^Loading sign-in$/);
  });
});

describe('AuthSkeleton layout opt-in', () => {
  it('fills and centres the section with layout="fill"', () => {
    const { container } = render(<AuthSkeleton layout="fill" />);
    const css: string = emotionCssFor(busyContainer(container));
    expect(css).toMatch(/flex-grow\s*:\s*1/);
    expect(css).toMatch(/display\s*:\s*flex/);
    expect(css).toMatch(/flex-direction\s*:\s*column/);
    expect(css).toMatch(/justify-content\s*:\s*center/);
    expect(css).toMatch(/padding-top\s*:\s*0\.5rem/);
  });

  it('keeps the section unflexed by default', () => {
    const { container } = render(<AuthSkeleton />);
    const css: string = emotionCssFor(busyContainer(container));
    expect(css).toMatch(/padding-top\s*:\s*0\.5rem/);
    expect(css).not.toContain('flex-grow');
    expect(css).not.toContain('justify-content');
    expect(css).not.toMatch(/display\s*:\s*flex/);
  });
});

describe('AuthSkeleton card tone opt-in', () => {
  it('uses the crm border and shadow with cardTone="crm"', () => {
    const { container } = render(<AuthSkeleton cardTone="crm" disableAnimation />);
    const css: string = emotionCssFor(card(container));
    expect(css).toMatch(/border\s*:\s*1px solid #EAECEE/);
    expect(css).toMatch(/box-shadow\s*:\s*0px 7px 40px 0px #E7E7E77D/);
    expect(css).not.toContain('#E1E7EA');
    expect(css).not.toContain('rgba(211, 216, 224, 0.2)');
    expect(css).toMatch(/border-radius\s*:\s*16px/);
  });

  it('keeps the brand border and shadow by default', () => {
    const { container } = render(<AuthSkeleton disableAnimation />);
    const css: string = emotionCssFor(card(container));
    expect(css).toMatch(/border\s*:\s*1px solid #E1E7EA/);
    expect(css).toMatch(/box-shadow\s*:\s*0px 7px 40px 0px rgba\(211, 216, 224, 0\.2\)/);
    expect(css).not.toContain('#EAECEE');
    expect(css).not.toContain('#E7E7E77D');
  });
});

describe('AuthSkeleton sm rules under an app theme', () => {
  it('resolves sm to 480 inside a tokens-scoped crm provider', () => {
    render(
      <ThemeProvider theme={appTheme}>
        <UiThemeProvider scope="tokens" variant="crm">
          <AuthSkeleton idPrefix="" />
        </UiThemeProvider>
      </ThemeProvider>
    );
    const css: string = emotionCssFor(fieldRow());
    expect(css).toMatch(/min-width\s*:\s*480px/);
    expect(css).not.toMatch(/min-width\s*:\s*640px/);
  });
});
