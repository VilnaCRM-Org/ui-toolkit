import colorTheme from '@/components/ui-color-theme';

/**
 * The shared helper-text treatment: Figma's "14 medium" (Inter Medium 14/18,
 * `letterSpacing: 0` — without it MUI's default caption tracking of `0.03333em`
 * reads looser than the design), `grey250` at rest and the palette `error.main`
 * (`#DC3939`) on error rather than MUI's own `#D32F2F`.
 *
 * `outlinedFieldTheme` installs it as the `MuiFormHelperText` style override for
 * every control that mounts a `ThemeProvider`. Controls that mount none reach it
 * through `helperTextSx` below, so the recipe is declared exactly once and a
 * change to the font, size or error colour cannot miss one of them.
 */
export const helperTextTypography = {
  margin: '0.25rem 0 0 0',
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  color: colorTheme.palette.grey250.main,
  '&.Mui-error': { color: colorTheme.palette.error.main },
};

/**
 * The same recipe as a DESCENDANT rule, for a control that renders MUI's helper
 * text without a `ThemeProvider` of its own (`UiPinInput`, `UiFileUploadInput`).
 * Merge it into the field root's `sx`.
 */
export const helperTextSx = {
  '& .MuiFormHelperText-root': helperTextTypography,
};
