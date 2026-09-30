import type { Theme } from '@mui/material';

import { cacheByTheme } from '@/utils/ui-theme';

import { socialButtonStyles } from './social-styles';
import {
  containedMediumStyles,
  containedStyles,
  dangerStyles,
  mediumLabelBox,
  outlinedStyles,
  responsiveLabelQuery,
  type ButtonStyle,
  type ButtonSxState,
  type ButtonVariantProps,
  type ButtonVariantRule,
} from './variant-styles';

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

export function withDefaults(props: ButtonVariantProps): ButtonVariantProps {
  return { ...props, variant: props.variant ?? 'text', size: props.size ?? 'medium' };
}

function matches(rule: ButtonVariantRule, props: ButtonVariantProps): boolean {
  return Object.entries(rule.props).every(
    ([key, value]) => props[key as keyof ButtonVariantProps] === value
  );
}

function withoutKey(style: ButtonStyle, key: string): ButtonStyle {
  return Object.fromEntries(Object.entries(style).filter(([entry]) => entry !== key));
}

function ruleStyle(theme: Theme, state: ButtonSxState, rule: ButtonVariantRule): ButtonStyle {
  return state.responsiveLabel === false
    ? withoutKey(rule.style, responsiveLabelQuery(theme))
    : rule.style;
}

export function matchedVariantStyles(theme: Theme, state: ButtonSxState): ButtonStyle[] {
  const resolved: ButtonVariantProps = withDefaults(state);
  return buttonVariants(theme)
    .filter((rule: ButtonVariantRule) => matches(rule, resolved))
    .map((rule: ButtonVariantRule) => ruleStyle(theme, state, rule));
}
