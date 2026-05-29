import { Link } from '@mui/material';
import React from 'react';
import { Trans } from 'react-i18next';

import UiTooltip from '../UiTooltip';
import UiTypography from '../UiTypography';

import ServicesHoverCard from './ServicesHoverCard';
import styles from './styles';
import { CardContentProps } from './types';

function CardContent({ item, isSmallCard }: CardContentProps): React.ReactElement {
  return (
    <>
      <UiTypography
        variant={isSmallCard ? 'h6' : 'h5'}
        component={isSmallCard ? 'h6' : 'h5'}
        sx={isSmallCard ? styles.smallTitle : styles.largeTitle}
      >
        <Trans i18nKey={item.title} />
      </UiTypography>
      <UiTypography
        variant={isSmallCard ? 'bodyText16' : 'bodyText18'}
        sx={isSmallCard ? styles.smallText : styles.largeText}
      >
        {isSmallCard ? (
          <Trans i18nKey={item.text}>
            Integrate
            <UiTooltip
              placement="bottom"
              arrow
              sx={styles.hoveredCard}
              title={<ServicesHoverCard />}
            >
              <Link href="/" sx={styles.servicesLink}>
                <UiTypography variant="bodyText16">services</UiTypography>
              </Link>
            </UiTooltip>
          </Trans>
        ) : (
          <Trans i18nKey={item.text} />
        )}
      </UiTypography>
    </>
  );
}
export default CardContent;
