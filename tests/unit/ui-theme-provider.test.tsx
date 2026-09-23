import { useTheme, type Theme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { sharedPalette } from '../../src/components/ui-color-theme';
import UiThemeProvider, { createUiTheme, uiTheme } from '../../src/components/ui-theme-provider';
import { createUiTheme as createFromUtils, uiTheme as utilsTheme } from '../../src/utils/ui-theme';

function Probe(): React.ReactElement {
  const { palette, breakpoints }: Theme = useTheme();
  const summary: string = [
    palette.primary.main,
    palette.brandGray.main,
    breakpoints.values.sm,
  ].join(' ');
  return <output aria-label="theme">{summary}</output>;
}

function probeText(): string | null {
  return screen.getByRole('status', { name: 'theme' }).textContent;
}

describe('UiThemeProvider', () => {
  it('re-exports the theme factory and the default theme', () => {
    expect(createUiTheme).toBe(createFromUtils);
    expect(uiTheme).toBe(utilsTheme);
  });

  it('provides the toolkit theme with the website breakpoints by default', () => {
    render(
      <UiThemeProvider>
        <Probe />
      </UiThemeProvider>
    );

    expect(probeText()).toBe(`${sharedPalette.primary.main} ${sharedPalette.brandGray.main} 640`);
  });

  it('merges the consumer overrides and selects the crm breakpoints', () => {
    render(
      <UiThemeProvider variant="crm" theme={{ palette: { primary: { main: '#ff0000' } } }}>
        <Probe />
      </UiThemeProvider>
    );

    expect(probeText()).toBe(`#ff0000 ${sharedPalette.brandGray.main} 480`);
  });

  it('keeps a variant carried inside the theme option when the prop is omitted', () => {
    render(
      <UiThemeProvider theme={{ variant: 'crm' }}>
        <Probe />
      </UiThemeProvider>
    );

    expect(probeText()).toBe(`${sharedPalette.primary.main} ${sharedPalette.brandGray.main} 480`);
  });

  it('lets the variant prop win over the one inside the theme option', () => {
    render(
      <UiThemeProvider variant="website" theme={{ variant: 'crm' }}>
        <Probe />
      </UiThemeProvider>
    );

    expect(probeText()).toBe(`${sharedPalette.primary.main} ${sharedPalette.brandGray.main} 640`);
  });

  it('rebuilds the theme when the props change', () => {
    const { rerender } = render(
      <UiThemeProvider theme={{ palette: { primary: { main: '#ff0000' } } }}>
        <Probe />
      </UiThemeProvider>
    );

    rerender(
      <UiThemeProvider variant="crm" theme={{ palette: { primary: { main: '#00ff00' } } }}>
        <Probe />
      </UiThemeProvider>
    );

    expect(probeText()).toBe(`#00ff00 ${sharedPalette.brandGray.main} 480`);
  });
});
