import type { SxProps, Theme } from '@mui/material';

import { fontFamilies } from '@/utils/font-tokens';
import { cacheByTheme } from '@/utils/ui-theme';

import { socialButtonStyles } from './social-styles';
import {
  containedMediumStyles,
  containedStyles,
  dangerStyles,
  mediumLabelBox,
  outlinedStyles,
  type ButtonStyle,
  type ButtonSxState,
  type ButtonVariantProps,
  type ButtonVariantRule,
} from './variant-styles';

type SxEntry = Exclude<SxProps<Theme>, ReadonlyArray<unknown>>;

const fontFamilyPin: ButtonStyle = { fontFamily: fontFamilies.golos, letterSpacing: 'inherit' };

function sizedRules(theme: Theme): ButtonVariantRule[] {
  return [
    {
      props: { variant: 'contained', size: 'small' },
      style: { ...containedStyles(theme), padding: '1rem 1.5rem' },
    },
    { props: { variant: 'contained', size: 'medium' }, style: containedMediumStyles(theme) },
    {
      props: { variant: 'outlined', size: 'small' },
      style: { ...outlinedStyles(theme), padding: '0.9375rem 1.4375rem' },
    },
    {
      props: { variant: 'outlined', size: 'medium' },
      style: { ...outlinedStyles(theme), ...mediumLabelBox, padding: '1.1875rem 1.9375rem' },
    },
  ];
}

export const buttonVariants: (theme: Theme) => ButtonVariantRule[] = cacheByTheme(
  (theme: Theme): ButtonVariantRule[] => [
    ...sizedRules(theme),
    {
      props: { name: 'socialButton', variant: 'outlined', size: 'medium' },
      style: socialButtonStyles(theme),
    },
    {
      props: { name: 'danger', variant: 'contained', size: 'small' },
      style: dangerStyles(theme),
    },
  ]
);

function withDefaults(props: ButtonVariantProps): ButtonVariantProps {
  return { ...props, variant: props.variant ?? 'text', size: props.size ?? 'medium' };
}

function matches(rule: ButtonVariantRule, props: ButtonVariantProps): boolean {
  return Object.entries(rule.props).every(
    ([key, value]) => props[key as keyof ButtonVariantProps] === value
  );
}

function matchedVariantStyles(theme: Theme, props: ButtonVariantProps): ButtonStyle[] {
  const resolved: ButtonVariantProps = withDefaults(props);
  return buttonVariants(theme)
    .filter((rule: ButtonVariantRule) => matches(rule, resolved))
    .map((rule: ButtonVariantRule) => rule.style);
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

function consumerEntries(sx: SxProps<Theme> | undefined): SxEntry[] {
  const consumerSx: SxProps<Theme> = sx ?? {};
  return (Array.isArray(consumerSx) ? consumerSx : [consumerSx]) as SxEntry[];
}

export function buttonSx(
  theme: Theme,
  state: ButtonSxState,
  sx: SxProps<Theme> | undefined
): SxProps<Theme> {
  const busyEntries: ButtonStyle[] = state.busy ? [busyStyles(theme)] : [];
  return [
    fontFamilyPin,
    ...matchedVariantStyles(theme, state),
    ...busyEntries,
    ...consumerEntries(sx),
  ] as SxProps<Theme>;
}
