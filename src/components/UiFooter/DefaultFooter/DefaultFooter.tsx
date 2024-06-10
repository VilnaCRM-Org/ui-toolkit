import { Box, Stack } from '@mui/material';
import Image from 'next/image';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Logo from '@/assets/svg/Logo.svg';
import UiTypography from '@/components/UiTypography';

import { PrivacyPolicy } from '../PrivacyPolicy';
import SocialMediaItem from '../SocialMediaItem/SocialMediaItem';
import { SocialMedia } from '../types';
import { VilnaCRMEmail } from '../VilnaCRMEmail';

import styles from './styles';

function DefaultFooter({ socialLinks }: { socialLinks: SocialMedia[] }): React.ReactElement {
  const { t } = useTranslation();

  const currentDate: Date = useMemo(() => new Date(), []);
  const currentYear: number = useMemo(() => currentDate.getFullYear(), [currentDate]);

  return (
    <Stack sx={styles.footerWrapper}>
      <Stack height="4.188rem" alignItems="center" flexDirection="row">
        <Box sx={styles.topWrapper}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={styles.topContent}
          >
            <Image src={Logo} alt={t('footer.logo_alt')} width={143} height={48} />
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
            <Stack direction="row" gap="0.875rem" alignItems="center">
              <VilnaCRMEmail />
              <Stack direction="row" alignItems="center" sx={styles.listWrapper}>
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
