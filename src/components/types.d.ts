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
    medium16?: CSSProperties | undefined;
    medium15?: CSSProperties | undefined;
    medium14?: CSSProperties | undefined;
    regular16?: CSSProperties | undefined;
    bodyText18?: CSSProperties | undefined;
    bodyText16?: CSSProperties | undefined;
    bold22?: CSSProperties | undefined;
    demi18?: CSSProperties | undefined;
    button?: CSSProperties | undefined;
    mobileText?: CSSProperties | undefined;
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
    patchMethod: Palette['primary'];
    getMethodHover: Palette['primary'];
    putMethodHover: Palette['primary'];
    postMethodHover: Palette['primary'];
    deleteMethodHover: Palette['primary'];
    patchMethodHover: Palette['primary'];
    mutedInkHover: Palette['primary'];
    notchDeskBefore: Palette['primary'];
    notchDeskAfter: Palette['primary'];
    notchMobileBefore: Palette['primary'];
    notchMobileAfter: Palette['primary'];
    textLinkHover: Palette['primary'];
    textLinkActive: Palette['primary'];
  }

  interface PaletteOptions {
    darkPrimary?: PaletteOptions['primary'] | undefined;
    darkSecondary?: PaletteOptions['primary'] | undefined;
    strokeDanger?: PaletteOptions['primary'] | undefined;
    white?: PaletteOptions['primary'] | undefined;
    brandGray?: PaletteOptions['primary'] | undefined;
    grey200?: PaletteOptions['primary'] | undefined;
    grey250?: PaletteOptions['primary'] | undefined;
    grey300?: PaletteOptions['primary'] | undefined;
    grey400?: PaletteOptions['primary'] | undefined;
    grey500?: PaletteOptions['primary'] | undefined;
    backgroundGrey100?: PaletteOptions['primary'] | undefined;
    backgroundGrey200?: PaletteOptions['primary'] | undefined;
    backgroundGrey300?: PaletteOptions['primary'] | undefined;
    containedButtonHover?: PaletteOptions['primary'] | undefined;
    containedButtonActive?: PaletteOptions['primary'] | undefined;
    patchMethod?: PaletteOptions['primary'] | undefined;
    getMethodHover?: PaletteOptions['primary'] | undefined;
    putMethodHover?: PaletteOptions['primary'] | undefined;
    postMethodHover?: PaletteOptions['primary'] | undefined;
    deleteMethodHover?: PaletteOptions['primary'] | undefined;
    patchMethodHover?: PaletteOptions['primary'] | undefined;
    mutedInkHover?: PaletteOptions['primary'] | undefined;
    notchDeskBefore?: PaletteOptions['primary'] | undefined;
    notchDeskAfter?: PaletteOptions['primary'] | undefined;
    notchMobileBefore?: PaletteOptions['primary'] | undefined;
    notchMobileAfter?: PaletteOptions['primary'] | undefined;
    textLinkHover?: PaletteOptions['primary'] | undefined;
    textLinkActive?: PaletteOptions['primary'] | undefined;
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
