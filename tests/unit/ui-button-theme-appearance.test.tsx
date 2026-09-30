import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import React from 'react';

import UiButton from '../../src/components/ui-button';
import { buttonSx } from '../../src/components/ui-button/styles';
import { uiTheme } from '../../src/components/ui-theme-provider';

import { emotionCssFor } from './utils/emotion-css';

const ambient: ReturnType<typeof createTheme> = createTheme({
  components: { MuiButton: { styleOverrides: { outlined: { borderRadius: '12px' } } } },
});

function mountUnder(theme: ReturnType<typeof createTheme>, node: React.ReactElement): HTMLElement {
  render(<ThemeProvider theme={theme}>{node}</ThemeProvider>);
  return screen.getByRole('button', { name: 'Go' });
}

describe('UiButton theme appearance', () => {
  it('lets the ambient MuiButton overrides style the button', () => {
    const button: HTMLElement = mountUnder(
      ambient,
      <UiButton appearance="theme" variant="outlined">
        Go
      </UiButton>
    );
    expect(getComputedStyle(button).borderRadius).toBe('12px');
  });

  it('keeps the kit radius without the opt-in', () => {
    const button: HTMLElement = mountUnder(ambient, <UiButton variant="outlined">Go</UiButton>);
    expect(getComputedStyle(button).borderRadius).toBe('3.563rem');
  });

  it('keeps the MUI button letter-spacing on a text button', () => {
    const button: HTMLElement = mountUnder(
      createTheme(),
      <UiButton appearance="theme">Go</UiButton>
    );
    expect(getComputedStyle(button).letterSpacing).toBe('0.02857em');
  });

  it('pins the letter-spacing to inherit in the kit appearance', () => {
    const button: HTMLElement = mountUnder(createTheme(), <UiButton>Go</UiButton>);
    expect(getComputedStyle(button).letterSpacing).toBe('inherit');
  });

  it('keeps the link resolution', () => {
    render(
      <UiButton appearance="theme" to={{ pathname: '/a', hash: '#b' }}>
        Go
      </UiButton>
    );
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/a#b');
  });

  it('emits only the focus and consumer entries', () => {
    const sx: unknown[] = buttonSx(
      uiTheme,
      { variant: 'contained', busy: true, appearance: 'theme', focusOutline: true },
      { margin: 1 }
    ) as unknown[];
    expect(sx).toHaveLength(2);
    expect(sx[1]).toEqual({ margin: 1 });
    expect(sx[0]).toHaveProperty('&:focus-visible');
  });

  it('keeps the kit entries for an explicit kit appearance', () => {
    const sx: unknown[] = buttonSx(
      uiTheme,
      { variant: 'contained', busy: true, appearance: 'kit' },
      undefined
    ) as unknown[];
    expect(sx[0]).toEqual({ fontFamily: expect.any(String), letterSpacing: 'inherit' });
    expect(sx).toHaveLength(3);
  });

  it('does not forward appearance, kitInk or responsiveLabel to the DOM', () => {
    render(
      <UiButton appearance="theme" kitInk responsiveLabel={false}>
        Go
      </UiButton>
    );
    const button: HTMLElement = screen.getByRole('button', { name: 'Go' });
    expect(button).not.toHaveAttribute('appearance');
    expect(button).not.toHaveAttribute('kitink');
    expect(button).not.toHaveAttribute('responsivelabel');
  });
});

describe('UiButton kit label ink', () => {
  const blue: ReturnType<typeof createTheme> = createTheme({
    palette: { primary: { main: '#1EAEFF' } },
  });

  it('paints the contained label white under a primary with no contrastText', () => {
    const button: HTMLElement = mountUnder(
      blue,
      <UiButton kitInk variant="contained">
        Go
      </UiButton>
    );
    expect(getComputedStyle(button).color).toBe('rgb(255, 255, 255)');
  });

  it('keeps the ambient contrast ink without the opt-in', () => {
    const button: HTMLElement = mountUnder(blue, <UiButton variant="contained">Go</UiButton>);
    expect(getComputedStyle(button).color).toBe('rgba(0, 0, 0, 0.87)');
  });

  it('adds the ink only to a contained button', () => {
    const outlined: unknown[] = buttonSx(
      uiTheme,
      { variant: 'outlined', busy: false, kitInk: true },
      undefined
    ) as unknown[];
    const contained: unknown[] = buttonSx(
      uiTheme,
      { variant: 'contained', busy: false, kitInk: true },
      undefined
    ) as unknown[];
    expect(outlined).not.toContainEqual({ color: '#FFF' });
    expect(contained[1]).toEqual({ color: '#FFF' });
  });
});

describe('UiButton responsive label', () => {
  const query: string = `@media (max-width: ${uiTheme.breakpoints.values.sm}px)`;

  it('drops the small-screen label rule when false', () => {
    const sx: Record<string, unknown>[] = buttonSx(
      uiTheme,
      { variant: 'contained', busy: false, responsiveLabel: false },
      undefined
    ) as Record<string, unknown>[];
    expect(sx[1]).not.toHaveProperty([query]);
    expect(sx[1]).toHaveProperty('fontWeight', '600');
  });

  it('keeps the small-screen label rule by default', () => {
    const sx: Record<string, unknown>[] = buttonSx(
      uiTheme,
      { variant: 'contained', busy: false, responsiveLabel: true },
      undefined
    ) as Record<string, unknown>[];
    expect(sx[1]).toHaveProperty([query], {
      fontSize: '0.9375rem',
      fontWeight: '400',
      lineHeight: '1.125rem',
      padding: '1rem 1.438rem',
    });
  });

  it('emits no small-screen rule in the rendered CSS when false', () => {
    render(
      <UiButton variant="contained" responsiveLabel={false}>
        Go
      </UiButton>
    );
    expect(emotionCssFor(screen.getByRole('button', { name: 'Go' }))).not.toContain('max-width');
  });
});

describe('UiButton native loading forwarded to MUI', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the MUI loading class and indicator', () => {
    render(
      <UiButton loadingMode="native" loading loadingIndicator={<span>X</span>}>
        Go
      </UiButton>
    );
    const button: HTMLElement = screen.getByRole('button', { name: /Go/ });
    expect(button).toHaveClass('MuiButton-loading');
    expect(button).toBeDisabled();
    expect(button.innerHTML).toMatch(
      /<span class="MuiButton-loadingIndicator[^"]*"[^>]*><span>X<\/span><\/span>/
    );
  });

  it('renders no MUI loading DOM in the default mode', () => {
    render(<UiButton loading>Go</UiButton>);
    const button: HTMLElement = screen.getByRole('button', { name: /Go/ });
    expect(button).not.toHaveClass('MuiButton-loading');
    expect(button.innerHTML).not.toContain('MuiButton-loadingWrapper');
  });

  it('renders no MUI loading DOM for an idle native button', () => {
    render(
      <UiButton loadingMode="native" loading={false}>
        Go
      </UiButton>
    );
    const button: HTMLElement = screen.getByRole('button', { name: /Go/ });
    expect(button).not.toHaveClass('MuiButton-loading');
    expect(button).toBeEnabled();
    expect(button.innerHTML).not.toContain('MuiButton-loadingWrapper');
  });

  it('schedules no announcement timer in native mode', () => {
    jest.useFakeTimers();
    render(
      <UiButton loadingMode="native" loading>
        Go
      </UiButton>
    );
    expect(jest.getTimerCount()).toBe(0);
  });

  it('schedules the announcement timer in the default mode', () => {
    jest.useFakeTimers();
    render(<UiButton loading>Go</UiButton>);
    expect(jest.getTimerCount()).toBe(1);
  });
});
