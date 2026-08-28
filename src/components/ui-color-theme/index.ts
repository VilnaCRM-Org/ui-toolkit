import { Theme, createTheme } from '@mui/material';

export const sharedPalette = {
  primary: {
    main: '#1EAEFF',
  },
  secondary: {
    main: '#FFC01E',
  },
  error: {
    main: '#DC3939',
  },
  strokeDanger: {
    main: '#DF7878',
  },
  success: {
    main: '#38B386',
  },
  white: {
    main: '#FFF',
  },
  darkPrimary: {
    main: '#1A1C1E',
  },
  darkSecondary: {
    main: '#1B2327',
  },
  brandGray: {
    main: '#E1E7EA',
  },
  grey200: {
    main: '#404142',
  },
  grey250: {
    main: '#57595B',
  },
  grey300: {
    main: '#969B9D',
  },
  grey400: {
    main: '#D0D4D8',
  },
  grey500: {
    main: '#EAECEE',
  },
  backgroundGrey100: {
    main: '#FBFBFB',
  },
  backgroundGrey200: {
    main: '#f4f5f6',
  },
  backgroundGrey300: {
    main: '#F5F6F7',
  },
  containedButtonHover: {
    main: '#00A3FF',
  },
  // PATCH has no semantic slot in the shared palette (the other four verbs reuse
  // primary/secondary/success/error), so it carries its own accent: the website's
  // `$patchColorTheme` from the swagger method table.
  patchMethod: {
    main: '#9B59B6',
  },
  // REST-method hover accents for the item row (border + badge text shift on
  // hover; the rest accents reuse primary/secondary/success/error).
  getMethodHover: {
    main: '#0091E2',
  },
  putMethodHover: {
    main: '#DD9F00',
  },
  postMethodHover: {
    main: '#00AE70',
  },
  // The one hover accent BRIGHTER than its base (`error #DC3939`): the Figma
  // DELETE hover master (439:19776) paints #FF2F2F, kept literally by owner
  // ruling (2026-08-26) over the earlier darken-for-consistency substitute.
  deleteMethodHover: {
    main: '#FF2F2F',
  },
  // PATCH is the one verb neither Figma nor the website gives a hover master for:
  // the website's method table has no hover state at all, and the Figma "atom
  // switcher" board predates PATCH. Derived instead by the transform the three
  // darkening masters share — hue and saturation held, lightness -12pp (the mean of
  // #1EAEFF→#0091E2, #FFC01E→#DD9F00 and #38B386→#00AE70). Replace it with a literal
  // the day a PATCH hover master lands in Figma.
  patchMethodHover: {
    main: '#7A4092',
  },
  // Muted (grey) item row: badge text + path darken to this ink on hover.
  mutedInkHover: {
    main: '#1C2022',
  },
  containedButtonActive: {
    main: '#0399ED',
  },
  notchDeskBefore: {
    main: '#080805',
  },
  notchDeskAfter: {
    main: '#0e314c',
  },
  notchMobileBefore: {
    main: '#0c0b0e',
  },
  notchMobileAfter: {
    main: '#0f0b25',
  },
  textLinkHover: {
    main: '#297FFF',
  },
  textLinkActive: {
    main: '#0399ED',
  },
} as const satisfies Record<string, { main: string }>;

export const websiteColorTheme: Theme = createTheme({
  palette: {
    ...sharedPalette,
  },
});

export const crmColorTheme: Theme = createTheme({
  palette: {
    ...sharedPalette,
  },
});

export default websiteColorTheme;
