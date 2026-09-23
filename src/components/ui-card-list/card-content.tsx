import React from 'react';

import UiTooltip from '../ui-tooltip';
import UiTypography from '../ui-typography';

import styles from './styles';
import { useContentRenderer } from './translated-content';
import type { HeadingLevel, UiCardItemData } from './types';

function CardText({
  item,
  isSmallCard,
}: {
  item: UiCardItemData;
  isSmallCard: boolean;
}): React.ReactElement {
  const renderContent = useContentRenderer();
  return (
    <UiTypography
      variant={isSmallCard ? 'bodyText16' : 'bodyText18'}
      sx={isSmallCard ? styles.smallText : styles.largeText}
    >
      {item.tooltipTitle && item.tooltipLabel ? (
        <>
          {renderContent(item.text)}{' '}
          <UiTooltip
            placement="bottom"
            arrow
            sx={styles.hoveredCard}
            title={renderContent(item.tooltipTitle)}
          >
            <UiTypography variant="bodyText16" component="span">
              {renderContent(item.tooltipLabel)}
            </UiTypography>
          </UiTooltip>
        </>
      ) : (
        renderContent(item.text)
      )}
    </UiTypography>
  );
}

export default function CardContent({
  item,
  isSmallCard,
  headingComponent,
}: {
  item: UiCardItemData;
  isSmallCard: boolean;
  headingComponent?: HeadingLevel | undefined;
}): React.ReactElement {
  const renderContent = useContentRenderer();
  return (
    <>
      <UiTypography
        variant={isSmallCard ? 'h6' : 'h5'}
        component={headingComponent ?? 'h3'}
        sx={isSmallCard ? styles.smallTitle : styles.largeTitle}
      >
        {renderContent(item.title)}
      </UiTypography>
      <CardText item={item} isSmallCard={isSmallCard} />
    </>
  );
}
