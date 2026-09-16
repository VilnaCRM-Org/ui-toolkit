import { Stack } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useDevWarning } from '@/utils/dev-warn';

import UiImage from '../ui-image';

import CardContent from './card-content';
import styles from './styles';
import type { UiCardItemProps } from './types';
import { untranslatedKeyWarning } from './untranslated-key';

function UiCardItem({ item, headingComponent }: UiCardItemProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  useDevWarning(untranslatedKeyWarning(item, (key: string): boolean => i18n.exists(key)));
  const isSmallCard: boolean = item.type === 'smallCard';

  return (
    <Stack sx={isSmallCard ? styles.smallWrapper : styles.largeWrapper}>
      <UiImage
        src={item.imageSrc}
        alt={t(item.alt)}
        sx={isSmallCard ? styles.smallImage : styles.largeImage}
      />
      <Stack direction="column">
        <CardContent item={item} isSmallCard={isSmallCard} headingComponent={headingComponent} />
      </Stack>
    </Stack>
  );
}

// A card list re-renders whenever its parent does, but the card data objects are
// referentially stable, so the default shallow comparison keeps every card (and
// the provider/Emotion work under it) out of that pass.
export default React.memo(UiCardItem);
