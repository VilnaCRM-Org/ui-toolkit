import { Link, Stack } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import UiTypography from '@/components/ui-typography';

import styles from './styles';

const defaultPrivacyPolicyUrl: string =
  'https://github.com/VilnaCRM-Org/website/blob/main/README.md#privacy-policy';
const defaultUsagePolicyUrl: string =
  'https://github.com/VilnaCRM-Org/website/blob/main/README.md#usage-policy';

function getPolicyUrl(value: string | undefined, fallbackUrl: string): string {
  return value?.trim() || fallbackUrl;
}

function PrivacyPolicy(): React.ReactElement {
  const { t } = useTranslation();
  const privacyPolicyUrl: string = getPolicyUrl(
    process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL,
    defaultPrivacyPolicyUrl
  );
  const usagePolicyUrl: string = getPolicyUrl(
    process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL,
    defaultUsagePolicyUrl
  );

  return (
    <Stack direction="row" sx={{ ...styles.wrapper, alignItems: 'center' }}>
      <Link target="_blank" rel="noopener noreferrer" sx={styles.link} href={privacyPolicyUrl}>
        <UiTypography variant="medium16" sx={styles.textColor}>
          {t('footer.privacy')}
        </UiTypography>
      </Link>
      <Link target="_blank" rel="noopener noreferrer" sx={styles.link} href={usagePolicyUrl}>
        <UiTypography variant="medium16" sx={styles.textColor}>
          {t('footer.usage_policy')}
        </UiTypography>
      </Link>
    </Stack>
  );
}

export default PrivacyPolicy;
