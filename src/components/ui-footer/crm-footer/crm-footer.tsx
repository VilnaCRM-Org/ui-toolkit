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
};

function FooterLink({
  href,
  label,
}: Readonly<{ href: string; label: string }>): React.ReactElement {
  return (
    <Link href={href} sx={styles.link}>
      <UiTypography sx={styles.linkText}>{label}</UiTypography>
    </Link>
  );
}

function CrmFooter({
  privacyHref = '/privacy-policy',
  usagePolicyHref = '/terms-of-use',
}: Readonly<CrmFooterProps>): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Box component="footer" sx={styles.footer}>
      <UiContainer>
        <Box sx={styles.content}>
          <Box
            component="img"
            src={resolveImageSrc(Logo)}
            alt={t('footer.logo_alt')}
            sx={styles.logo}
          />
          <Box sx={styles.links}>
            <FooterLink href={privacyHref} label={t('footer.privacy')} />
            <FooterLink href={usagePolicyHref} label={t('footer.usage_policy')} />
          </Box>
        </Box>
      </UiContainer>
    </Box>
  );
}

export default CrmFooter;
