import { Theme, ThemeProvider, createTheme, useTheme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import ScopedThemeProvider from '../../src/components/theme-scope';

// Two independent themes: `createTheme` fills every unspecified slot with MUI's
// defaults, so these share a few top-level slots by reference (`direction`,
// `applyStyles`, …) while differing on `components`. That overlap is what makes
// them the right fixture for the `every` -> `some` mutation below.
const scopedTheme: Theme = createTheme({
  components: { MuiTypography: { styleOverrides: { root: { letterSpacing: '0.5px' } } } },
});
const foreignTheme: Theme = createTheme({
  components: { MuiTypography: { styleOverrides: { root: { letterSpacing: '1.5px' } } } },
});

function ThemeProbe({ onTheme }: { onTheme: (theme: Theme) => void }): React.ReactElement {
  const theme: Theme = useTheme();

  // Recorded from an effect, not from render: React may replay or discard a
  // render pass, and the assertions below are about the theme that committed.
  React.useEffect(() => {
    onTheme(theme);
  }, [onTheme, theme]);

  return <span>probe</span>;
}

function collectThemes(): { record: (theme: Theme) => void; seen: Theme[] } {
  const seen: Theme[] = [];
  return { record: (theme: Theme): void => void seen.push(theme), seen };
}

describe('ScopedThemeProvider', () => {
  it('applies the theme when the surrounding context does not already carry it', () => {
    const { record, seen } = collectThemes();

    render(
      <ScopedThemeProvider theme={scopedTheme}>
        <ThemeProbe onTheme={record} />
      </ScopedThemeProvider>
    );

    // With no outer provider MUI's default theme is what sits in context, so
    // this also kills the `if` -> `true` ConditionalExpression collapse:
    // skipping here would render the subtree against those defaults.
    expect(screen.getByText('probe')).toBeInTheDocument();
    expect(seen[0].components).toBe(scopedTheme.components);
  });

  it('mounts nothing when the surrounding context already resolves to that theme', () => {
    const outer = collectThemes();
    const inner = collectThemes();

    render(
      <ThemeProvider theme={scopedTheme}>
        <ThemeProbe onTheme={outer.record} />
        <ScopedThemeProvider theme={scopedTheme}>
          <ThemeProbe onTheme={inner.record} />
        </ScopedThemeProvider>
      </ThemeProvider>
    );

    // Identity, not equality: mounting a provider always produces a freshly
    // merged theme object, so the same reference proves none was mounted.
    expect(inner.seen[0]).toBe(outer.seen[0]);
  });

  it('collapses a scope nested directly inside an identical scope', () => {
    const outer = collectThemes();
    const inner = collectThemes();

    render(
      <ScopedThemeProvider theme={scopedTheme}>
        <ThemeProbe onTheme={outer.record} />
        <ScopedThemeProvider theme={scopedTheme}>
          <ThemeProbe onTheme={inner.record} />
        </ScopedThemeProvider>
      </ScopedThemeProvider>
    );

    expect(inner.seen[0]).toBe(outer.seen[0]);
  });

  it('still isolates its subtree when the outer theme differs in any slot', () => {
    const outer = collectThemes();
    const inner = collectThemes();

    render(
      <ThemeProvider theme={foreignTheme}>
        <ThemeProbe onTheme={outer.record} />
        <ScopedThemeProvider theme={scopedTheme}>
          <ThemeProbe onTheme={inner.record} />
        </ScopedThemeProvider>
      </ThemeProvider>
    );

    // Kills the `every` -> `some` MethodExpression mutant: the two themes share
    // several top-level slots by reference, so `some` would report "already
    // applied" and drop the provider, leaking the foreign `components` in.
    expect(inner.seen[0]).not.toBe(outer.seen[0]);
    expect(inner.seen[0].components).toBe(scopedTheme.components);
    expect(outer.seen[0].components).toBe(foreignTheme.components);
  });

  it('applies the theme when the surrounding context carries CSS variables', () => {
    const outer = collectThemes();
    const inner = collectThemes();
    // Same slots as `scopedTheme` by reference, plus the `vars` bag a
    // CSS-variables host puts in context. Skipping here would leave every
    // `(theme.vars || theme).palette` read resolving against the host.
    const cssVariablesTheme: Theme = { ...scopedTheme, vars: {} } as unknown as Theme;

    render(
      <ThemeProvider theme={cssVariablesTheme}>
        <ThemeProbe onTheme={outer.record} />
        <ScopedThemeProvider theme={scopedTheme}>
          <ThemeProbe onTheme={inner.record} />
        </ScopedThemeProvider>
      </ThemeProvider>
    );

    expect(outer.seen[0].vars).toEqual({});
    expect(inner.seen[0]).not.toBe(outer.seen[0]);
    expect(inner.seen[0].vars).toBeNull();
  });
});
