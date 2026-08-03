import type { IntegrationLogo } from './types';

/** A logo the card can really paint: a usable URL plus its intrinsic box. */
export interface ResolvedLogo {
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
// before the image loads AND what the vertical placement rule is computed from, so
// a zero, negative, NaN or missing value cannot reproduce the master's geometry.
function isUsableSize(value: number | undefined): value is number {
  return value != null && Number.isFinite(value) && value > 0;
}

/**
 * The logo the card paints, or `null` when the bundle is unusable — in which case
 * NO `<img>` is rendered at all and the card dev-warns instead (a11y contract
 * §3.5/§12.4). The card's `minHeight` keeps the geometry either way.
 */
export function resolveLogo(logo: IntegrationLogo | undefined): ResolvedLogo | null {
  const src: string | null = logoUrl(logo?.src);
  const width: number | undefined = logo?.width;
  const height: number | undefined = logo?.height;
  if (src == null || !isUsableSize(width) || !isUsableSize(height)) {
    return null;
  }
  return { src, width, height };
}
