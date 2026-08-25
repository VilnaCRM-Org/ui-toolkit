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
const TITLE_KEY: string = 'why_us.headers.header_ready_templates';
const ALT_KEY: string = 'why_us.alt_image.alt_ready_templates';

// Resolved through i18next rather than hardcoded English (agents.md), so an edit
// to the resource bundle moves the expectation with it instead of breaking here.
function titleIn(language: string): string {
  return i18n.t(TITLE_KEY, { lng: language });
}

const translatedItem: UiCardItemData = {
  type: 'smallCard',
  id: 'translated-card',
  imageSrc: 'https://example.com/open-source.png',
  title: TITLE_KEY,
  text: 'why_us.texts.text_you_have_store',
  alt: ALT_KEY,
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

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(titleIn('en'));

    await switchLanguage('uk');

    // The same referentially stable `item` is still in place, so this only
    // passes while the card body re-renders with its ancestor.
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(titleIn('uk'));
    expect(screen.getByRole('img')).toHaveAttribute('alt', i18n.t(ALT_KEY));
  });

  it('falls back to English when the card switches to an unbundled locale', async () => {
    // Starting from `uk` rather than `en` is what makes the assertion able to
    // fail: `en` is the fallback, so a card frozen on its previous render would
    // be indistinguishable from a correct fallback if we started there.
    expect(titleIn('uk')).not.toBe(titleIn('en'));

    render(<UiCardItem item={translatedItem} />);
    await switchLanguage('uk');
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(titleIn('uk'));

    await switchLanguage('de');

    // Negative path: `de` ships no resources, so i18next's `fallbackLng` takes
    // over. The card must re-render onto the fallback copy rather than stay on
    // the previous language or leak the raw translation key.
    const heading: HTMLElement = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent(titleIn('en'));
    expect(heading).not.toHaveTextContent(titleIn('uk'));
    expect(screen.queryByText(TITLE_KEY)).not.toBeInTheDocument();
  });

  it('leaves ReactNode title and text untouched across a language change', async () => {
    const nodeItem: UiCardItemData = {
      ...translatedItem,
      title: <span>Literal title</span>,
      text: <span>Literal text</span>,
    };

    render(<UiCardItem item={nodeItem} />);

    await switchLanguage('uk');

    // Boundary case: non-string content bypasses `<Trans>` entirely, so a
    // language change must re-render the card without rewriting what the
    // consumer passed in.
    expect(screen.getByText('Literal title')).toBeInTheDocument();
    expect(screen.getByText('Literal text')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', i18n.t(ALT_KEY));
  });
});
