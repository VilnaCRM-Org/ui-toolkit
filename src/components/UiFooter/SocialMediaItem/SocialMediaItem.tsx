import { Box, Link } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { resolveImageSrc } from '@/types/assets';

import { SocialMedia } from '../types';

import styles from './styles';

function SocialMediaItem({ item }: Readonly<{ item: SocialMedia }>): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Box sx={styles.navLink}>
      <Link
        href={item.linkHref}
        aria-label={t(item.ariaLabel)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* The link's aria-label is the accessible name; the icon is decorative,
            so its alt is empty to avoid a redundant second a11y-tree node. */}
        <img src={resolveImageSrc(item.icon)} alt="" width={20} height={20} />
      </Link>
    </Box>
  );
}

export default SocialMediaItem;
