import React from 'react';
import { Trans } from 'react-i18next';

import UiTooltip from '../UiTooltip';
import UiTypography from '../UiTypography';

import ServicesHoverCard from './ServicesHoverCard';
import styles from './styles';
import type { CardContentProps } from './types';

function CardContent({
  item,
  isSmallCard,
  headingComponent,
}: Readonly<CardContentProps>): React.ReactElement {
  const titleComponent: NonNullable<CardContentProps['headingComponent']> =
    headingComponent ?? (isSmallCard ? 'h6' : 'h5');

  return (
    <>
      <UiTypography
        variant={isSmallCard ? 'h6' : 'h5'}
        component={titleComponent}
        sx={isSmallCard ? styles.smallTitle : styles.largeTitle}
      >
        <Trans i18nKey={item.title} />
      </UiTypography>
      <UiTypography
        variant={isSmallCard ? 'bodyText16' : 'bodyText18'}
        sx={isSmallCard ? styles.smallText : styles.largeText}
      >
        {isSmallCard ? (
          // The tooltip wrapper already exposes the disclosure as a focusable
          // role="button" (Enter/Space toggles it), so the trigger is a plain
          // inline span — not a nested <a>/<p>, which would be invalid markup
          // and a WCAG 4.1.2 nested-interactive violation. aria-controls on the
          // trigger is a known follow-up tracked against the UiTooltip wrapper.
          <Trans i18nKey={item.text}>
            Integrate
            <UiTooltip placement="bottom" arrow title={<ServicesHoverCard />}>
              <UiTypography component="span" variant="bodyText16" sx={styles.hoveredCard}>
                services
              </UiTypography>
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
