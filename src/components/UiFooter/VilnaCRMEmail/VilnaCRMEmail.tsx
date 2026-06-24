import { Box, Link } from '@mui/material';
import React from 'react';

import UiTypography from '@/components/UiTypography';

import styles from './styles';

const defaultEmailAddress: string = 'info@vilnacrm.com';

function VilnaCRMEmail(): React.ReactElement {
  const email: string = process.env.REACT_APP_VILNACRM_GMAIL?.trim() || defaultEmailAddress;

  return (
    <Box sx={styles.emailWrapper}>
      <UiTypography variant="medium15" sx={styles.emailText}>
        <Link href={`mailto:${email}`} sx={styles.emailLink}>
          {email}
        </Link>
      </UiTypography>
    </Box>
  );
}

export default VilnaCRMEmail;
