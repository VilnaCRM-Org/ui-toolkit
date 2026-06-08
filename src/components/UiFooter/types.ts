import type { ReactElement, ReactNode } from 'react';

export type UiFooterSocialLink = {
  id: string;
  href: string;
  label: string;
  icon?: ReactElement | string;
};

export type UiFooterProps = {
  logo?: ReactNode;
  privacyContent?: ReactNode;
  emailContent?: ReactNode;
  socialLinks: UiFooterSocialLink[];
  copyrightLabel: string;
};
