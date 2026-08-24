import { Theme, createTheme } from '@mui/material';

export const sharedPalette: Record<string, { main: string }> = {
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
  // REST-method hover accents for the item row (border + badge text darken on
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
  // Darker than the DELETE base (`error #DC3939`) so the accent genuinely darkens
  // on hover like the other methods; matches the DELETE row-hover-shadow tone
  // (`rgb(199, 44, 44)`) so the hover recipe stays internally consistent.
  deleteMethodHover: {
    main: '#C72C2C',
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
} as const;

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
