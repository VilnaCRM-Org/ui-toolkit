import type { ReactElement, ReactNode } from 'react';

import type { StaticImageSrc } from '@/types/assets';

export interface SocialMedia {
  id: string;
  icon: StaticImageSrc;
  // Retained for documentation/back-compat; the icon renders with empty alt
  // because the link's aria-label provides the accessible name.
  alt: string;
  linkHref: string;
  ariaLabel: string;
}

export type UiFooterSocialLink = {
  id: string;
  href: string;
  label: string;
  icon?: ReactElement | string | undefined;
};

export type UiFooterProps = {
  logo?: ReactNode | undefined;
  privacyContent?: ReactNode | undefined;
  emailContent?: ReactNode | undefined;
  socialLinks: UiFooterSocialLink[];
  copyrightLabel: string;
};
