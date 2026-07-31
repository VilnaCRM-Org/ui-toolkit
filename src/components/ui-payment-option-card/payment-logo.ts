import type { IntegrationLogo } from '../ui-integration-card/types';

import type { UiPaymentOptionCardProps } from './types';

/** A wordmark the card can really paint: a usable URL plus its intrinsic box. */
export interface ResolvedPaymentLogo {
  src: string;
  width: number;
  height: number;
}

// Accepts a URL string or a static import (`{ src }`). The optional chains absorb
// a runtime nullish bundle, which the strict prop type forbids but API/CMS data
// does not.
function logoUrl(source: IntegrationLogo['src'] | undefined): string | null {
  if (typeof source === 'string') {
    return source || null;
  }
  return source?.src || null;
}

// Both dimensions must be real, positive numbers: they are what reserve the box
// before the image loads AND what keep the wordmark's aspect ratio while it scales
// down, so a zero, negative, NaN or missing value cannot reproduce the master.
function isUsableSize(value: number | undefined): value is number {
  return value != null && Number.isFinite(value) && value > 0;
}

/**
 * One wordmark bundle resolved, or `null` when it is unusable — in which case NO
 * `<img>` is rendered at all and the card dev-warns instead. The card's `minHeight`
 * keeps the geometry either way.
 */
export function resolvePaymentLogo(logo: IntegrationLogo | undefined): ResolvedPaymentLogo | null {
  const src: string | null = logoUrl(logo?.src);
  const width: number | undefined = logo?.width;
  const height: number | undefined = logo?.height;
  if (src == null || !isUsableSize(width) || !isUsableSize(height)) {
    return null;
  }
  return { src, width, height };
}

/** The two inputs the enabled/disabled mark choice is made from. */
export interface PaymentMarkRequest {
  card: UiPaymentOptionCardProps;
  /** The `aria-disabled` boundary result, not the raw prop. */
  disabled: boolean;
}

/**
 * The mark to paint. The disabled wordmark is an ASSET swap rather than a CSS
 * filter — `grayscale(1)` and `opacity` both miss Figma's flat `#D0D4D8` badly — so
 * the choice happens here, in the model layer. `logoDisabled` is optional and falls
 * back to the full-colour mark, so a provider that ships no grey variant still
 * renders sensibly instead of blanking out.
 */
export function resolvePaymentMark(
  request: Readonly<PaymentMarkRequest>
): ResolvedPaymentLogo | null {
  const enabled: ResolvedPaymentLogo | null = resolvePaymentLogo(request.card.logo);
  if (!request.disabled) {
    return enabled;
  }
  return resolvePaymentLogo(request.card.logoDisabled) ?? enabled;
}
