import { Box, Container, Stack } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Logo from '@/assets/svg/Logo.svg';
import UiTypography from '@/components/UiTypography';
import { resolveImageSrc } from '@/types/assets';

import PrivacyPolicy from '../PrivacyPolicy';
import SocialMediaItem from '../SocialMediaItem/SocialMediaItem';
import type { SocialMedia } from '../types';
import VilnaCRMEmail from '../VilnaCRMEmail';

import styles from './styles';

function Mobile({ socialLinks }: Readonly<{ socialLinks: SocialMedia[] }>): React.ReactElement {
  const { t } = useTranslation();
  const logoUrl: string = resolveImageSrc(Logo);
  const currentYear: number = new Date().getFullYear();
  return (
    <Container sx={styles.wrapper}>
      <Stack sx={styles.content}>
        <img src={logoUrl} alt={t('footer.logo_alt')} width={131} height={44} loading="lazy" />
        <Stack direction="row" sx={{ ...styles.listWrapper, alignItems: 'center' }}>
          {socialLinks.map(item => (
            <SocialMediaItem item={item} key={item.id} />
          ))}
        </Stack>
      </Stack>
      <VilnaCRMEmail />
      <PrivacyPolicy />
      <UiTypography variant="medium15" sx={styles.copyright}>
        {t('footer.copyright')}, <Box component="span">{currentYear}</Box>
      </UiTypography>
    </Container>
  );
}

export default Mobile;
