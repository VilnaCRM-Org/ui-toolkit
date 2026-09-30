import { createTheme, type Theme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import backToMainStyles from '../../src/components/ui-back-to-main/styles';
import containerStyles from '../../src/components/ui-container/styles';
import UiFooter from '../../src/components/ui-footer';
import crmFooterStyles from '../../src/components/ui-footer/crm-footer/styles';
import footerStyles from '../../src/components/ui-footer/styles';
import UiThemeProvider, { createUiTheme } from '../../src/components/ui-theme-provider';

import { emotionCssFor } from './utils/emotion-css';

type StyleBuilder = (theme: Theme) => Record<string, unknown>;

const custom: { xs: number; sm: number; md: number; lg: number; xl: number } = {
  xs: 0,
  sm: 500,
  md: 900,
  lg: 1100,
  xl: 1500,
};
const customTheme: Theme = createUiTheme({ breakpoints: { values: custom } });
const hostTheme: Theme = createTheme({ breakpoints: { values: custom } });

function mediaKeys(builder: unknown, theme: Theme): string[] {
  return Object.keys((builder as StyleBuilder)(theme)).filter(key => key.startsWith('@media'));
}

describe('breakpoints resolved at render time', () => {
  it('pads UiContainer on the breakpoints of the UI theme in scope', () => {
    expect(mediaKeys(containerStyles.container, customTheme)).toEqual([
      '@media (min-width:900px)',
      '@media (min-width:1100px)',
      '@media (min-width:1500px)',
    ]);
  });

  it('falls back to the website breakpoints under a host theme without the kit tokens', () => {
    expect(mediaKeys(containerStyles.container, hostTheme)).toEqual([
      '@media (min-width:768px)',
      '@media (min-width:1024px)',
      '@media (min-width:1440px)',
    ]);
  });

  it('switches the website footer layouts on the md breakpoint of the UI theme in scope', () => {
    expect(mediaKeys(footerStyles.default, customTheme)).toEqual(['@media (max-width: 900px)']);
    expect(mediaKeys(footerStyles.adaptive, customTheme)).toEqual(['@media (max-width: 900px)']);
    expect(mediaKeys(footerStyles.topContent, customTheme)).toEqual(['@media (max-width: 1100px)']);
    expect(mediaKeys(footerStyles.copyrightAndLinks, customTheme)).toEqual([
      '@media (max-width: 1100px)',
    ]);
  });

  it('lays out the crm footer logo on the breakpoints of the UI theme in scope', () => {
    expect(mediaKeys(crmFooterStyles.logo, customTheme)).toEqual([
      '@media (min-width:900px)',
      '@media (min-width:1100px)',
      '@media (min-width:1500px)',
    ]);
  });

  it('pads the back-to-main band and label on the lg breakpoint of the UI theme in scope', () => {
    expect(mediaKeys(backToMainStyles.section, customTheme)).toEqual(['@media (min-width:1100px)']);
    expect(mediaKeys(backToMainStyles.backText, customTheme)).toEqual([
      '@media (min-width:1100px)',
    ]);
  });

  it('renders the crm footer with the breakpoints of the provider around it', () => {
    render(
      <UiThemeProvider theme={{ breakpoints: { values: custom } }}>
        <UiFooter variant="crm" />
      </UiThemeProvider>
    );

    const css: string = emotionCssFor(screen.getByRole('contentinfo'));
    expect(css).toMatch(/min-width:\s*900px/);
    expect(css).toMatch(/min-width:\s*1500px/);
  });
});
