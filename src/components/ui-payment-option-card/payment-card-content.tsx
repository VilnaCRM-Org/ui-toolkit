import { Box } from '@mui/material';
import React from 'react';

import { srOnlySx } from '../field-controls';

import type { ResolvedPaymentLogo } from './payment-logo';
import { CIRCLE_CLASS, LOGO_CLASS, paymentLogoSx, selectionCircleSx } from './styles';

// The visible content shared by the wired (radio button) and static shells — ONE
// DOM tree, identical reading order. The card has no text node of its own, so the
// wordmark's `alt` is the whole accessible name and there is no `aria-label`
// anywhere in the tree (WCAG 2.5.3). No heading role: the page outline belongs to
// the consumer.

// PAINT, never a control: a CSS-drawn circle, not an `<input type="radio">`, not a
// MUI `Radio`, never focusable and never a nested interactive element — the card is
// a SINGLE control. The checked/unchecked change reaches assistive tech through
// `aria-checked` alone, so the circle is hidden.
function PaymentSelectionCircle(): React.ReactElement {
  return (
    <Box component="span" aria-hidden="true" className={CIRCLE_CLASS} sx={selectionCircleSx} />
  );
}

interface PaymentLogoImageProps {
  name: string;
  logo: ResolvedPaymentLogo;
}

// INFORMATIVE `alt`, the one deliberate deviation from `UiIntegrationCard`: there
// the brand name is adjacent visible text, so its logo is decorative. This card
// carries no text at all, so a decorative wordmark would leave a nameless radio
// (SC 4.1.2). A real `<img>`, sized in BOTH attributes so the box is reserved
// before the mark loads, and deliberately NOT lazy — payment options are
// above-the-fold checkout content.
function PaymentLogoImage({ name, logo }: Readonly<PaymentLogoImageProps>): React.ReactElement {
  return (
    <Box
      component="img"
      className={LOGO_CLASS}
      src={logo.src}
      alt={name}
      width={logo.width}
      height={logo.height}
      decoding="async"
      draggable={false}
      sx={paymentLogoSx}
    />
  );
}

// The fallback for an unusable bundle. The wordmark's `alt` is normally this
// card's ENTIRE accessible name, so rendering nothing here would leave the wired
// radio unnamed (SC 4.1.2) — a runtime data defect turning into a barrier. The
// name is therefore always in the tree; when the mark paints it rides the `alt`,
// and when it cannot it rides this visually hidden text instead. The card still
// dev-warns, because a missing wordmark is still wrong.
function PaymentNameFallback({ name }: Readonly<{ name: string }>): React.ReactElement {
  return (
    <Box component="span" sx={srOnlySx}>
      {name}
    </Box>
  );
}

export interface PaymentCardContentProps {
  name: string;
  logo: ResolvedPaymentLogo | null;
}

export function PaymentCardContent({
  name,
  logo,
}: Readonly<PaymentCardContentProps>): React.ReactElement {
  return (
    <>
      <PaymentSelectionCircle />
      {logo ? <PaymentLogoImage name={name} logo={logo} /> : <PaymentNameFallback name={name} />}
    </>
  );
}
