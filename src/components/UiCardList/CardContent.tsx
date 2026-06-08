import React from 'react';
import { Trans } from 'react-i18next';

import UiTooltip from '../UiTooltip';
import UiTypography from '../UiTypography';

import styles from './styles';
import { UiCardItemData } from './types';

function renderContent(content: string | React.ReactNode): React.ReactNode {
  return typeof content === 'string' ? <Trans i18nKey={content} /> : content;
}

export default function CardContent({
  item,
  isSmallCard,
}: {
  item: UiCardItemData;
  isSmallCard: boolean;
}): JSX.Element {
  return (
    <>
      <UiTypography
        variant={isSmallCard ? 'h6' : 'h5'}
        component="h3"
        sx={isSmallCard ? styles.smallTitle : styles.largeTitle}
      >
        {renderContent(item.title)}
      </UiTypography>
      <UiTypography
        variant={isSmallCard ? 'bodyText16' : 'bodyText18'}
        sx={isSmallCard ? styles.smallText : styles.largeText}
      >
        {item.tooltipTitle && item.tooltipLabel ? (
          <>
            {renderContent(item.text)}{' '}
            <UiTooltip placement="bottom" arrow sx={styles.hoveredCard} title={item.tooltipTitle}>
              <UiTypography variant="bodyText16" component="span">
                {item.tooltipLabel}
              </UiTypography>
            </UiTooltip>
          </>
        ) : (
          renderContent(item.text)
        )}
      </UiTypography>
    </>
  );
}
