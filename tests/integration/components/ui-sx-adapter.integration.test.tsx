import { createTheme, ThemeProvider, type SxProps, type Theme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { crmBreakpointValues } from '../../../src/components/ui-breakpoints';
import UiButton from '../../../src/components/ui-button';
import UiSxAdapter from '../../../src/components/ui-sx-adapter';
import type { UiSxAdapterRenderProps } from '../../../src/components/ui-sx-adapter/types';
import UiThemeProvider from '../../../src/components/ui-theme-provider';

const RED: string = 'rgb(255, 0, 0)';
const BRAND: string = 'rgb(30, 174, 255)';

const consumerTheme = { palette: { primary: { main: '#ff0000' } } };

const cardSx: SxProps<Theme> = { color: 'primary.main', p: 2 };

interface ThirdPartyCardProps {
  label: string;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
}

function ThirdPartyCard({
  label,
  className,
  style,
}: Readonly<ThirdPartyCardProps>): React.ReactElement {
  return (
    <article aria-label={label} className={className} style={style}>
      {label}
    </article>
  );
}

function AdaptedCard({ label, inline }: { label: string; inline: boolean }): React.ReactElement {
  return (
    <UiSxAdapter sx={cardSx} inline={inline}>
      {({ className, style }: UiSxAdapterRenderProps) => (
        <ThirdPartyCard label={label} className={className} style={style} />
      )}
    </UiSxAdapter>
  );
}

function Screen(): React.ReactElement {
  return (
    <>
      <UiButton variant="contained" size="small">
        Save
      </UiButton>
      <AdaptedCard label="Class card" inline={false} />
      <AdaptedCard label="Inline card" inline />
    </>
  );
}

function card(name: string): HTMLElement {
  return screen.getByRole('article', { name });
}

function mediaQueries(): string[] {
  return Array.from(document.styleSheets)
    .flatMap(sheet => Array.from(sheet.cssRules))
    .map(rule => rule.cssText)
    .filter(text => text.startsWith('@media'));
}

describe('UiSxAdapter reaching a component that cannot take sx', () => {
  it('resolves the consumer tokens in both modes, as the toolkit button does', () => {
    render(
      <UiThemeProvider theme={consumerTheme}>
        <Screen />
      </UiThemeProvider>
    );

    expect(screen.getByRole('button', { name: 'Save' })).toHaveStyle({ backgroundColor: RED });
    expect(card('Class card')).toHaveStyle({ color: RED, padding: '16px' });
    expect(card('Inline card')).toHaveStyle({ color: RED, padding: '16px' });
    expect(card('Inline card')).not.toHaveAttribute('class');
  });

  it('falls back to the toolkit tokens under a foreign MUI theme', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <Screen />
      </ThemeProvider>
    );

    expect(card('Class card')).toHaveStyle({ color: BRAND });
    expect(card('Inline card')).toHaveStyle({ color: BRAND });
  });

  it('resolves responsive values against the variant breakpoints', () => {
    const responsiveSx: SxProps<Theme> = { width: { sm: '24rem' } };
    render(
      <UiThemeProvider variant="crm">
        <UiSxAdapter sx={responsiveSx}>
          {({ className }: UiSxAdapterRenderProps) => (
            <ThirdPartyCard label="Responsive card" className={className} />
          )}
        </UiSxAdapter>
      </UiThemeProvider>
    );

    expect(card('Responsive card')).toBeInTheDocument();
    expect(mediaQueries()).toContainEqual(
      expect.stringContaining(`min-width:${crmBreakpointValues.sm}px`)
    );
  });
});
