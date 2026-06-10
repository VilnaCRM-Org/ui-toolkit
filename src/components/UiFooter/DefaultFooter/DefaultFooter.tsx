import { Box, Stack } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Logo from '@/assets/svg/Logo.svg';
import UiTypography from '@/components/UiTypography';

import PrivacyPolicy from '../PrivacyPolicy';
import SocialMediaItem from '../SocialMediaItem/SocialMediaItem';
import { SocialMedia } from '../types';
import VilnaCRMEmail from '../VilnaCRMEmail';

import styles from './styles';

function DefaultFooter({
  socialLinks,
}: Readonly<{ socialLinks: SocialMedia[] }>): React.ReactElement {
  const { t } = useTranslation();
  const logoUrl: string = typeof Logo === 'string' ? Logo : Logo.src;

  const currentYear: number = new Date().getFullYear();

  return (
    <Stack sx={styles.footerWrapper}>
      <Stack direction="row" sx={{ height: '4.188rem', alignItems: 'center' }}>
        <Box sx={styles.topWrapper}>
          <Stack
            direction="row"
            sx={{ ...styles.topContent, justifyContent: 'space-between', alignItems: 'center' }}
          >
            <img src={logoUrl} alt={t('footer.logo_alt')} width={143} height={48} loading="lazy" />
            <PrivacyPolicy />
          </Stack>
        </Box>
      </Stack>
      <Box sx={styles.bottomWrapper}>
        <Stack sx={styles.copyrightAndLinksWrapper}>
          <Stack sx={styles.copyrightAndLinks}>
            <UiTypography variant="medium15" sx={styles.copyright}>
              {t('footer.copyright')}, <Box component="span">{currentYear}</Box>
            </UiTypography>
            <Stack direction="row" sx={{ gap: '0.875rem', alignItems: 'center' }}>
              <VilnaCRMEmail />
              <Stack direction="row" sx={{ ...styles.listWrapper, alignItems: 'center' }}>
                {socialLinks.map(item => (
                  <SocialMediaItem item={item} key={item.id} />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}

export default DefaultFooter;
