import React from 'react';
import { useTranslation } from 'react-i18next';

import UiTypography from '../ui-typography';

import styles from './styles';

export const FALLBACK_KEY: string = 'error_boundary.default_message';
export const FALLBACK_MESSAGE: string = 'Something went wrong.';

// This node is MOUNTED with its text already in place, which assistive
// technology announces. The prior-art comment in
// `../ui-calendar-multi-select/calendar-messages.tsx` ("a role toggled onto a
// static node does not announce") describes attribute mutation on an already
// mounted node and does not apply here, so do not "fix" this into a
// pre-existing-container shape. Bare `role="alert"`: no `aria-live`, no
// `aria-atomic`, no `aria-label`, no `tabIndex`, no programmatic focus.
//
// `variant="bold22"` is load-bearing: #DC3939 on white measures 4.480:1, which
// fails the WCAG AA 4.5:1 bar for normal text but clears the 3:1 large-text bar
// at 22px / weight 700. Swapping to a body variant reintroduces that failure.
//
// The key is absent from the loaded resources on purpose, so `t()` always
// resolves through `defaultValue` - including inside an i18next instance that
// carries no resources at all.
export default function DefaultFallback(): React.ReactElement {
  // `useSuspense: false` is load-bearing: with the default (true), a host app
  // still loading its i18next backend makes this hook THROW a suspense promise
  // while the fallback renders, and a throwing fallback escalates past the
  // boundary into the blank page this component exists to prevent.
  const { t } = useTranslation(undefined, { useSuspense: false });

  return (
    <UiTypography variant="bold22" role="alert" sx={styles.fallback}>
      {t(FALLBACK_KEY, { defaultValue: FALLBACK_MESSAGE })}
    </UiTypography>
  );
}
