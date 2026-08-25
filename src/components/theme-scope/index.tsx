import { Theme, ThemeProvider, useTheme } from '@mui/material';
import React from 'react';

type ThemeSlots = Record<string, unknown>;

interface ScopedThemeProviderProps {
  /** Module-scope theme this scope guarantees for its subtree. */
  theme: Theme;
  children: React.ReactNode;
}

// MUI merges a nested provider into the outer theme with a shallow spread —
// `{...outerTheme, ...localTheme}` in @mui/system's ThemeProvider — so a theme
// whose every top-level slot is ALREADY the same object reference in context
// merges to a value-identical theme. Detecting that lets the provider be
// skipped without changing a single resolved style.
//
// Reference equality (never a deep compare) is what makes the skip provably
// behaviour-preserving: one differing slot — `components`, `palette`,
// `typography`, … — falls back to mounting the provider, which is exactly the
// isolation UiLink and UiTypography rely on when a consumer supplies a foreign
// theme. It is also cheap: a handful of `===` checks over ~20 slots, against
// the six component instances and four React contexts a provider really mounts.
function isAlreadyApplied(outerTheme: Theme, localTheme: Theme): boolean {
  const outerSlots: ThemeSlots = outerTheme as unknown as ThemeSlots;
  const localSlots: ThemeSlots = localTheme as unknown as ThemeSlots;

  // MUI stamps `vars: null` onto a provider's theme when that theme declares
  // neither `colorSchemes` nor `vars`, expressly to stop CSS-variable
  // inheritance from an upper theme. `vars` is not an own key of a
  // `createTheme()` result, so the slot walk below would never look at it —
  // under a CSS-variables host, skipping would leave the host's `--mui-*`
  // values in play for every `(theme.vars || theme).palette` read.
  if (outerSlots.vars != null) {
    return false;
  }

  return Object.keys(localSlots).every(slot => outerSlots[slot] === localSlots[slot]);
}

/**
 * Idempotent replacement for MUI's `ThemeProvider`: guarantees `theme` for its
 * subtree, but mounts nothing when the surrounding context already resolves to
 * that same theme — the redundant case produced by nesting self-providing
 * components, or by an ancestor that pre-applies the theme at its own root.
 *
 * Object themes only. MUI's callback form (`theme={outer => …}`) derives from
 * the outer theme and is never redundant, so it is deliberately not accepted:
 * the prop type keeps it out rather than a runtime guard.
 */
export default function ScopedThemeProvider({
  theme,
  children,
}: ScopedThemeProviderProps): React.ReactElement {
  const outerTheme: Theme = useTheme();

  if (isAlreadyApplied(outerTheme, theme)) {
    return <>{children}</>;
  }

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
