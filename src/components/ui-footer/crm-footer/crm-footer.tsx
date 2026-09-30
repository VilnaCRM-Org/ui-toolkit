import type { SxProps, Theme } from '@mui/material';
import { Box, Link } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Logo from '@/assets/svg/Logo.svg';
import UiContainer from '@/components/ui-container';
import UiTypography from '@/components/ui-typography';
import { resolveImageSrc } from '@/types/assets';

import styles from './styles';

export type CrmFooterProps = {
  privacyHref?: string | undefined;
  usagePolicyHref?: string | undefined;
  logo?: React.ReactNode | undefined;
  slotProps?: { link?: { sx?: SxProps<Theme> | undefined } | undefined } | undefined;
};

function FooterLink({
  href,
  label,
  sx,
}: Readonly<{
  href: string;
  label: string;
  sx: SxProps<Theme> | undefined;
}>): React.ReactElement {
  return (
    <Link href={href} sx={[styles.link, ...(Array.isArray(sx) ? sx : [sx])]}>
      <UiTypography inheritTheme sx={styles.linkText}>
        {label}
      </UiTypography>
    </Link>
  );
}

function DefaultLogo(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <Box component="img" src={resolveImageSrc(Logo)} alt={t('footer.logo_alt')} sx={styles.logo} />
  );
}

function CrmFooter({
  privacyHref = '/privacy-policy',
  usagePolicyHref = '/terms-of-use',
  logo,
  slotProps,
}: Readonly<CrmFooterProps>): React.ReactElement {
  const { t } = useTranslation();
  const linkSx: SxProps<Theme> | undefined = slotProps?.link?.sx;

  return (
    <Box component="footer" sx={styles.footer}>
      <UiContainer>
        <Box sx={styles.content}>
          {logo === undefined ? <DefaultLogo /> : logo}
          <Box sx={styles.links}>
            <FooterLink href={privacyHref} label={t('footer.privacy')} sx={linkSx} />
            <FooterLink href={usagePolicyHref} label={t('footer.usage_policy')} sx={linkSx} />
          </Box>
        </Box>
      </UiContainer>
    </Box>
  );
}

export default CrmFooter;
