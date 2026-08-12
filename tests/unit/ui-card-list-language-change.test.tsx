import { act, render, screen } from '@testing-library/react';
import i18n from 'i18next';
import React from 'react';

import type { UiCardItemData } from '../../src/components/ui-card-list/types';
import UiCardItem from '../../src/components/ui-card-list/ui-card-item';

// Card copy reaches the DOM two different ways: `alt` through `useTranslation`
// in UiCardItem, and title/text through `<Trans>` in CardContent. `<Trans>` does
// NOT subscribe to i18next (react-i18next's Trans only reads the instance out of
// context), so it re-renders solely because an ancestor does. Memoizing the card
// body would cut that path and leave a card whose alt text is in the new
// language while its visible copy is stale.
const translatedItem: UiCardItemData = {
  type: 'smallCard',
  id: 'translated-card',
  imageSrc: 'https://example.com/open-source.png',
  title: 'why_us.headers.header_ready_templates',
  text: 'why_us.texts.text_you_have_store',
  alt: 'why_us.alt_image.alt_ready_templates',
};

describe('UiCardItem language changes', () => {
  async function switchLanguage(language: string): Promise<void> {
    // i18next emits `languageChanged` synchronously from inside changeLanguage,
    // which is what wakes react-i18next's store subscribers; act() flushes the
    // renders that emit schedules.
    await act(async () => {
      await i18n.changeLanguage(language);
    });
  }

  afterEach(async () => {
    await switchLanguage('en');
  });

  it('re-translates every part of a card when the language changes', async () => {
    render(<UiCardItem item={translatedItem} />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Ready templates');

    await switchLanguage('uk');

    // The same referentially stable `item` is still in place, so this only
    // passes while the card body re-renders with its ancestor.
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Готові шаблони');
    expect(screen.getByRole('img')).toHaveAttribute(
      'alt',
      i18n.t('why_us.alt_image.alt_ready_templates')
    );
  });
});
