import React from 'react';
import { Trans } from 'react-i18next';

import ScopedThemeProvider from '../theme-scope';
import UiTooltip from '../ui-tooltip';
import UiTypography, { typographyTheme } from '../ui-typography';

import styles from './styles';
import type { HeadingLevel, UiCardItemData } from './types';

function renderContent(content: string | React.ReactNode): React.ReactNode {
  return typeof content === 'string' ? <Trans i18nKey={content} /> : content;
}

function CardText({
  item,
  isSmallCard,
}: {
  item: UiCardItemData;
  isSmallCard: boolean;
}): React.ReactElement {
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

// One typography scope for the card body. The title and the body text are two
// UiTypography instances that would otherwise each mount their own identical
// provider; hoisted here they resolve against the theme this scope already
// supplies and mount nothing, and when an ancestor pre-applies that theme this
// scope collapses too.
//
// Two providers deliberately survive. UiTooltip's, because its theme is a
// different object. And the tooltip LABEL's UiTypography (see CardText), which
// is not redundant at all: MUI merges themes with a shallow spread, so the
// tooltip theme replaces the whole `typography` slot and `bodyText16` stops
// existing beneath it — that inner provider is what restores the label's colour
// and font instead of letting it inherit the trigger's link styling.
//
// Deliberately NOT wrapped in React.memo, unlike UiCardItem. `<Trans>` does not
// subscribe to i18next — react-i18next's Trans only reads the instance out of
// context — so it re-renders only because an ancestor does. UiCardItem holds
// that subscription (`useTranslation`), and a memo boundary here would cut the
// path between them: on a language change the card's `alt` would follow the new
// language while its visible title and body stayed on the old one. The memo on
// UiCardItem already stops unrelated parent re-renders one level up, so this
// boundary would buy nothing anyway. Locked by the language-change test.
export default function CardContent({
  item,
  isSmallCard,
  headingComponent,
}: {
  item: UiCardItemData;
  isSmallCard: boolean;
  headingComponent?: HeadingLevel | undefined;
}): React.ReactElement {
  return (
    <ScopedThemeProvider theme={typographyTheme}>
      <UiTypography
        variant={isSmallCard ? 'h6' : 'h5'}
        component={headingComponent ?? 'h3'}
        sx={isSmallCard ? styles.smallTitle : styles.largeTitle}
      >
        {renderContent(item.title)}
      </UiTypography>
      <CardText item={item} isSmallCard={isSmallCard} />
    </ScopedThemeProvider>
  );
}
