import type { SxProps, Theme } from '@mui/material';

import { fontFamilies } from '@/utils/font-tokens';
import { cacheByTheme } from '@/utils/ui-theme';

import { matchedVariantStyles, withDefaults } from './variant-rules';
import type { ButtonStyle, ButtonSxState } from './variant-styles';

export { buttonVariants } from './variant-rules';

type SxEntry = Exclude<SxProps<Theme>, ReadonlyArray<unknown>>;

const fontFamilyPin: ButtonStyle = { fontFamily: fontFamilies.golos, letterSpacing: 'inherit' };

const kitInkStyles: (theme: Theme) => ButtonStyle = cacheByTheme(
  (theme: Theme): ButtonStyle => ({ color: theme.palette.white.main })
);

function inkEntries(theme: Theme, state: ButtonSxState): ButtonStyle[] {
  const contained: boolean = withDefaults(state).variant === 'contained';
  return state.kitInk === true && contained ? [kitInkStyles(theme)] : [];
}

function themed(state: ButtonSxState): boolean {
  return state.appearance === 'theme';
}

function variantEntries(theme: Theme, state: ButtonSxState): ButtonStyle[] {
  if (themed(state)) {
    return [];
  }
  return [fontFamilyPin, ...inkEntries(theme, state), ...matchedVariantStyles(theme, state)];
}

export const busyStyles: (theme: Theme) => ButtonStyle = cacheByTheme(
  (theme: Theme): ButtonStyle => ({
    color: 'transparent',
    pointerEvents: 'none',
    cursor: 'default',
    '&.MuiButton-contained .MuiCircularProgress-root': {
      color: theme.palette.white.main,
    },
  })
);

const nativeBusyStyles: ButtonStyle = { '&:disabled': { color: 'transparent' } };

function busyEntries(theme: Theme, state: ButtonSxState): ButtonStyle[] {
  if (!state.busy || themed(state)) {
    return [];
  }
  return state.native ? [busyStyles(theme), nativeBusyStyles] : [busyStyles(theme)];
}

const focusOutlineStyles: (theme: Theme) => ButtonStyle = cacheByTheme(
  (theme: Theme): ButtonStyle => ({
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.grey200.main}`,
      outlineOffset: '2px',
      boxShadow: 'none',
    },
    '&.MuiButton-contained:focus-visible': {
      backgroundColor: theme.palette.containedButtonHover.main,
    },
  })
);

function focusEntries(theme: Theme, state: ButtonSxState): ButtonStyle[] {
  return state.focusOutline === true ? [focusOutlineStyles(theme)] : [];
}

function consumerEntries(sx: SxProps<Theme> | undefined): SxEntry[] {
  const consumerSx: SxProps<Theme> = sx ?? {};
  return (Array.isArray(consumerSx) ? consumerSx : [consumerSx]) as SxEntry[];
}

export function buttonSx(
  theme: Theme,
  state: ButtonSxState,
  sx: SxProps<Theme> | undefined
): SxProps<Theme> {
  return [
    ...variantEntries(theme, state),
    ...focusEntries(theme, state),
    ...busyEntries(theme, state),
    ...consumerEntries(sx),
  ] as SxProps<Theme>;
}
