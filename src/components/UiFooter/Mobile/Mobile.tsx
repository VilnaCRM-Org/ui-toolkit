import { Box, Container, Stack } from '@mui/material';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Logo from '@/assets/svg/Logo.svg';
import UiTypography from '@/components/UiTypography';

import { PrivacyPolicy } from '../PrivacyPolicy';
import SocialMediaItem from '../SocialMediaItem/SocialMediaItem';
import { SocialMedia } from '../types';
import { VilnaCRMEmail } from '../VilnaCRMEmail';

import styles from './styles';

function Mobile({ socialLinks }: { socialLinks: SocialMedia[] }): React.ReactElement {
  const { t } = useTranslation();
  const currentDate: Date = useMemo(() => new Date(), []);
  const currentYear: number = useMemo(() => currentDate.getFullYear(), [currentDate]);
  return (
    <Container sx={styles.wrapper}>
      <Stack sx={styles.content}>
        <Image src={Logo} alt={t('footer.logo_alt')} width={131} height={44} />
        <Stack direction="row" alignItems="center" sx={styles.listWrapper}>
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
