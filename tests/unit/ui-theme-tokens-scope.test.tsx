import { Box, Button, createTheme, ThemeProvider, Typography, type Theme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import UiThemeProvider, { createUiTheme } from '../../src/components/ui-theme-provider';
import { smUpQuery } from '../../src/utils/ui-breakpoint-queries';
import {
  defaultUiTheme,
  resolveUiTheme,
  useUiTheme,
  withUiFallback,
} from '../../src/utils/ui-theme';

import { emotionCssFor } from './utils/emotion-css';

const appTheme: Theme = createTheme({ palette: { primary: { main: '#1EAEFF' } } });

function KitProbe(): React.ReactElement {
  const theme: Theme = useUiTheme();
  return <output aria-label="kit sm">{theme.breakpoints.values.sm}</output>;
}

function kitSm(): string | null {
  return screen.getByRole('status', { name: 'kit sm' }).textContent;
}

function renderInApp(children: React.ReactNode): void {
  render(<ThemeProvider theme={appTheme}>{children}</ThemeProvider>);
}

describe('UiThemeProvider scope="tokens"', () => {
  it('resolves the crm kit tokens under an app theme that is not a UiTheme', () => {
    renderInApp(
      <UiThemeProvider scope="tokens" variant="crm">
        <KitProbe />
      </UiThemeProvider>
    );

    expect(kitSm()).toBe('480');
  });

  it('keeps the website fallback when no tokens scope is in the tree', () => {
    renderInApp(<KitProbe />);

    expect(kitSm()).toBe('640');
  });

  it('moves the sm rules of sx style builders to the scoped breakpoints', () => {
    renderInApp(
      <UiThemeProvider scope="tokens" variant="crm">
        <Box sx={(theme: Theme) => ({ [smUpQuery(theme)]: { color: 'red' } })}>scoped</Box>
      </UiThemeProvider>
    );

    const css: string = emotionCssFor(screen.getByText('scoped'));
    expect(css).toMatch(/min-width:\s*480px/);
    expect(css).not.toMatch(/min-width:\s*640px/);
  });

  it('leaves plain MUI components on the app theme', () => {
    let seen: Theme | undefined;
    function AppProbe(): React.ReactElement {
      seen = useUiTheme();
      return <Typography variant="h4">heading</Typography>;
    }
    renderInApp(
      <UiThemeProvider scope="tokens" variant="crm">
        <AppProbe />
        <Button variant="contained">plain</Button>
      </UiThemeProvider>
    );

    const headingCss: string = emotionCssFor(screen.getByText('heading'));
    expect(headingCss).toMatch(/font-size:\s*2\.125rem/);
    expect(headingCss).toMatch(/font-weight:\s*400/);
    expect(emotionCssFor(screen.getByRole('button', { name: 'plain' }))).toMatch(
      /--variant-containedColor:\s*rgba\(0, 0, 0, 0\.87\)/
    );
    expect(seen?.breakpoints.values.md).toBe(768);
  });

  it('prefers an ambient UiTheme over the scoped fallback', () => {
    render(
      <UiThemeProvider variant="website">
        <UiThemeProvider scope="tokens" variant="crm">
          <KitProbe />
        </UiThemeProvider>
      </UiThemeProvider>
    );

    expect(kitSm()).toBe('640');
  });

  it('builds the scoped fallback from the theme options', () => {
    renderInApp(
      <UiThemeProvider
        scope="tokens"
        theme={{ breakpoints: { values: { xs: 0, sm: 500, md: 900, lg: 1100, xl: 1500 } } }}
      >
        <KitProbe />
      </UiThemeProvider>
    );

    expect(kitSm()).toBe('500');
  });
});

describe('withUiFallback', () => {
  it('copies the outer theme and carries the fallback for resolveUiTheme', () => {
    const fallback: Theme = createUiTheme({ variant: 'crm' });
    const scoped: Theme = withUiFallback(fallback)(appTheme);

    expect(scoped).not.toBe(appTheme);
    expect(scoped.palette).toBe(appTheme.palette);
    expect(scoped.breakpoints).toBe(appTheme.breakpoints);
    expect(resolveUiTheme(scoped)).toBe(fallback);
    expect(resolveUiTheme(appTheme)).toBe(defaultUiTheme());
  });
});
