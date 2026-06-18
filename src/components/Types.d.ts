import type { CSSProperties } from 'react';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    medium16: CSSProperties;
    medium15: CSSProperties;
    medium14: CSSProperties;
    regular16: CSSProperties;
    bodyText18: CSSProperties;
    bodyText16: CSSProperties;
    bold22: CSSProperties;
    demi18: CSSProperties;
    button: CSSProperties;
    mobileText: CSSProperties;
  }

  interface TypographyVariantsOptions {
    medium16?: CSSProperties;
    medium15?: CSSProperties;
    medium14?: CSSProperties;
    regular16?: CSSProperties;
    bodyText18?: CSSProperties;
    bodyText16?: CSSProperties;
    bold22?: CSSProperties;
    demi18?: CSSProperties;
    button?: CSSProperties;
    mobileText?: CSSProperties;
  }

  interface Palette {
    darkPrimary: Palette['primary'];
    darkSecondary: Palette['primary'];
    strokeDanger: Palette['primary'];
    white: Palette['primary'];
    brandGray: Palette['primary'];
    grey200: Palette['primary'];
    grey250: Palette['primary'];
    grey300: Palette['primary'];
    grey400: Palette['primary'];
    grey500: Palette['primary'];
    backgroundGrey100: Palette['primary'];
    backgroundGrey200: Palette['primary'];
    backgroundGrey300: Palette['primary'];
    containedButtonHover: Palette['primary'];
    containedButtonActive: Palette['primary'];
    notchDeskBefore: Palette['primary'];
    notchDeskAfter: Palette['primary'];
    notchMobileBefore: Palette['primary'];
    notchMobileAfter: Palette['primary'];
    textLinkHover: Palette['primary'];
    textLinkActive: Palette['primary'];
  }

  interface PaletteOptions {
    darkPrimary?: PaletteOptions['primary'];
    darkSecondary?: PaletteOptions['primary'];
    strokeDanger?: PaletteOptions['primary'];
    white?: PaletteOptions['primary'];
    brandGray?: PaletteOptions['primary'];
    grey200?: PaletteOptions['primary'];
    grey250?: PaletteOptions['primary'];
    grey300?: PaletteOptions['primary'];
    grey400?: PaletteOptions['primary'];
    grey500?: PaletteOptions['primary'];
    backgroundGrey100?: PaletteOptions['primary'];
    backgroundGrey200?: PaletteOptions['primary'];
    backgroundGrey300?: PaletteOptions['primary'];
    containedButtonHover?: PaletteOptions['primary'];
    containedButtonActive?: PaletteOptions['primary'];
    notchDeskBefore?: PaletteOptions['primary'];
    notchDeskAfter?: PaletteOptions['primary'];
    notchMobileBefore?: PaletteOptions['primary'];
    notchMobileAfter?: PaletteOptions['primary'];
    textLinkHover?: PaletteOptions['primary'];
    textLinkActive?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    medium16: true;
    medium15: true;
    medium14: true;
    regular16: true;
    bodyText18: true;
    bodyText16: true;
    bold22: true;
    demi18: true;
    button: true;
    mobileText: true;
  }
}
