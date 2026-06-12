import { StaticImageSrc } from '@/types/assets';

export interface SocialMedia {
  id: string;
  icon: StaticImageSrc;
  // Retained for documentation/back-compat; the icon renders with empty alt
  // because the link's aria-label provides the accessible name.
  alt: string;
  linkHref: string;
  ariaLabel: string;
}
