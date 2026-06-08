import { Box, Container, Stack } from '@mui/material';
import React, { useMemo } from 'react';

import UiLink from '../UiLink';
import UiTypography from '../UiTypography';

import styles from './styles';
import { UiFooterProps, UiFooterSocialLink } from './types';

function FooterSocialLinks({
  socialLinks,
}: {
  socialLinks: UiFooterSocialLink[];
}): React.ReactElement {
  return (
    <Stack direction="row" sx={styles.socialLinks}>
      {socialLinks.map((link) => (
        <UiLink key={link.id} href={link.href} aria-label={link.label}>
          {link.icon ?? link.label}
        </UiLink>
      ))}
    </Stack>
  );
}

function DefaultFooter({
  logo,
  privacyContent,
  emailContent,
  socialLinks,
  copyrightLabel,
}: UiFooterProps): React.ReactElement {
  const currentDate = useMemo(() => new Date(), []);
  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);

  return (
    <Stack sx={styles.footerWrapper}>
      <Stack direction="row" sx={{ height: '4.188rem', alignItems: 'center' }}>
        <Box sx={styles.topWrapper}>
          <Stack
            direction="row"
            sx={[styles.topContent, { justifyContent: 'space-between', alignItems: 'center' }]}
          >
            <Box>{logo}</Box>
            <Box>{privacyContent}</Box>
          </Stack>
        </Box>
      </Stack>
      <Box sx={styles.bottomWrapper}>
        <Stack sx={styles.copyrightAndLinksWrapper}>
          <Stack sx={styles.copyrightAndLinks}>
            <UiTypography variant="medium15" sx={styles.copyright}>
              {copyrightLabel}, <Box component="span">{currentYear}</Box>
            </UiTypography>
            <Stack direction="row" sx={styles.socialLinks}>
              <Box>{emailContent}</Box>
              <FooterSocialLinks socialLinks={socialLinks} />
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}

function MobileFooter({
  logo,
  privacyContent,
  emailContent,
  socialLinks,
  copyrightLabel,
}: UiFooterProps): React.ReactElement {
  const currentDate = useMemo(() => new Date(), []);
  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);

  return (
    <Container sx={styles.mobileWrapper}>
      <Stack sx={styles.mobileContent}>
        <Box>{logo}</Box>
        <FooterSocialLinks socialLinks={socialLinks} />
      </Stack>
      <Box>{emailContent}</Box>
      <Box>{privacyContent}</Box>
      <UiTypography variant="medium15" sx={styles.mobileCopyright}>
        {copyrightLabel}, <Box component="span">{currentYear}</Box>
      </UiTypography>
    </Container>
  );
}

export default function UiFooter(props: UiFooterProps): React.ReactElement {
  return (
    <Box component="footer" id="Contacts">
      <Box sx={styles.default}>
        <DefaultFooter {...props} />
      </Box>
      <Box sx={styles.adaptive}>
        <MobileFooter {...props} />
      </Box>
    </Box>
  );
}
