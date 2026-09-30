import type { SxProps, Theme } from '@mui/material';
import { Box } from '@mui/material';
import React from 'react';

import socialLinks from './constants';
import CrmFooter from './crm-footer';
import DefaultFooter from './default-footer';
import Mobile from './mobile';
import styles from './styles';

function UiFooter({
  variant,
  privacyHref,
  usagePolicyHref,
  logo,
  slotProps,
}: Readonly<{
  /**
   * `'website'` (the default) is the marketing footer with socials and the
   * external policy links. `'crm'` is the app footer: the logo and the two
   * same-tab policy links, whose targets default to `/privacy-policy` and
   * `/terms-of-use`.
   */
  variant?: 'website' | 'crm' | undefined;
  /** Privacy-policy link target in the `'crm'` variant. */
  privacyHref?: string | undefined;
  /** Usage-policy link target in the `'crm'` variant. */
  usagePolicyHref?: string | undefined;
  logo?: React.ReactNode | undefined;
  slotProps?: { link?: { sx?: SxProps<Theme> | undefined } | undefined } | undefined;
}>): React.ReactElement {
  if (variant === 'crm') {
    return (
      <CrmFooter
        privacyHref={privacyHref}
        usagePolicyHref={usagePolicyHref}
        logo={logo}
        slotProps={slotProps}
      />
    );
  }
  return (
    <Box component="footer" id="Contacts">
      <Box sx={styles.default}>
        <DefaultFooter socialLinks={socialLinks} />
      </Box>
      <Box sx={styles.adaptive}>
        <Mobile socialLinks={socialLinks} />
      </Box>
    </Box>
  );
}

export default UiFooter;
