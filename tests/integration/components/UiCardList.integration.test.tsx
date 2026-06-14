import { useMediaQuery } from '@mui/material';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import UiCardList from '../../../src/components/UiCardList';
import {
  LARGE_CARDLIST_ARRAY,
  SMALL_CARDLIST_ARRAY,
} from '../../../src/components/UiCardList/constants';
import { UiCardItemData } from '../../../src/components/UiCardList/types';

// Integration tier: render UiCardList with its REAL composed child chain
// (CardGrid / CardSwiper -> UiCardItem -> CardContent -> UiImage / UiTooltip).
// The ONLY mock is `@mui/material`'s `useMediaQuery`, which gates the grid-vs-
// swiper variant. Everything `requireActual` keeps gives the real MUI surface
// (Box, Grid, Stack, Tooltip, etc.) so the cards render end to end. The third-
// party `swiper/react` ESM library is replaced by a jsdom-friendly stand-in via
// `moduleNameMapper` (a build constraint, not a composed-child mock): the real
// CardSwiper component, with its UiCardItem subtree, still executes.
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

const mockedUseMediaQuery: jest.Mock = useMediaQuery as jest.Mock;

// Resolved English copy from i18n/localization.json. i18n is initialised
// globally in jest.setup, so the keys in the demo arrays resolve to these
// strings (kept here so the assertions read against user-visible text).
const LARGE_TITLES: string[] = [
  'Open source',
  'Ease of setup',
  'Ready templates',
  'Ideal for services',
  'All required integrations',
  'Bonus: easy migration',
];
const LARGE_FIRST_TEXT: string =
  'Thanks to the open source code, you can modify and add CRM functions as you need them';
const LARGE_FIRST_ALT: string = 'Image card of open source';

const SMALL_TITLES: string[] = ['Public API', 'Ready plugins for CMS', 'Web Hook System'];
const SMALL_FIRST_TEXT_FRAGMENT: string =
  'For cases when you did not find the desired ready-made integration';
const SMALL_FIRST_ALT: string = 'Image of Ruby';

function setLargeScreen(): void {
  // `useMediaQuery('(max-width: ...)')` is the small-screen probe; false -> grid.
  mockedUseMediaQuery.mockReturnValue(false);
}

function setSmallScreen(): void {
  mockedUseMediaQuery.mockReturnValue(true);
}

// Both variant wrappers (`gridContainerLargeScreen` / `swiperContainerSmallScreen`)
// have `display: none` as their base value and only switch to `block` inside a
// media query. jsdom does not evaluate those media queries, so the rendered
// subtree computes to `display: none` and role queries treat it as hidden. The
// markup, roles and translated text are all really present — this is the real
// composed DOM — so role queries pass `hidden: true` to reach it.
const HIDDEN: { hidden: true } = { hidden: true };

describe('UiCardList integration (real composed child chain)', () => {
  describe('large-screen grid variant', () => {
    it('renders the real CardGrid -> UiCardItem -> CardContent tree with each heading', () => {
      setLargeScreen();

      render(<UiCardList cardList={LARGE_CARDLIST_ARRAY} />);

      // No swiper stand-in means CardSwiper did not render: grid variant only.
      expect(screen.queryByTestId('swiper')).not.toBeInTheDocument();

      const headings: HTMLElement[] = screen.getAllByRole('heading', HIDDEN);
      const headingTexts: string[] = headings.map(heading => heading.textContent ?? '');
      LARGE_TITLES.forEach(title => {
        expect(headingTexts).toContain(title);
      });
    });

    it("renders each card's real UiImage and resolves the alt text via i18n", () => {
      setLargeScreen();

      render(<UiCardList cardList={LARGE_CARDLIST_ARRAY} />);

      const images: HTMLImageElement[] = screen.getAllByRole('img', HIDDEN);
      expect(images).toHaveLength(LARGE_CARDLIST_ARRAY.length);
      images.forEach(image => {
        expect(image).toHaveAttribute('src');
        expect(image).toHaveAttribute('loading', 'lazy');
      });

      // The first card's translated alt resolves end to end through UiCardItem.
      expect(screen.getByAltText(LARGE_FIRST_ALT)).toBeInTheDocument();
    });

    it('renders each card body text from the real CardContent', () => {
      setLargeScreen();

      render(<UiCardList cardList={LARGE_CARDLIST_ARRAY} />);

      expect(screen.getByText(LARGE_FIRST_TEXT)).toBeInTheDocument();
    });

    it('honours a headingComponent override across the whole real grid', () => {
      setLargeScreen();

      render(<UiCardList cardList={LARGE_CARDLIST_ARRAY} headingComponent="h2" />);

      const level2Headings: HTMLElement[] = screen.getAllByRole('heading', {
        level: 2,
        hidden: true,
      });
      expect(level2Headings).toHaveLength(LARGE_CARDLIST_ARRAY.length);
      level2Headings.forEach(heading => {
        expect(heading.tagName).toBe('H2');
      });
    });
  });

  describe('small-screen swiper variant', () => {
    it('renders the real CardSwiper -> UiCardItem tree, one slide per card', () => {
      setSmallScreen();

      render(<UiCardList cardList={SMALL_CARDLIST_ARRAY} />);

      // The swiper stand-in marks that the real CardSwiper variant mounted.
      expect(screen.getByTestId('swiper')).toBeInTheDocument();
      expect(screen.getAllByTestId('swiper-slide')).toHaveLength(SMALL_CARDLIST_ARRAY.length);

      const headingTexts: string[] = screen
        .getAllByRole('heading', HIDDEN)
        .map(heading => heading.textContent ?? '');
      SMALL_TITLES.forEach(title => {
        expect(headingTexts).toContain(title);
      });
    });

    it('renders the real images and translated alt/body copy inside the swiper', () => {
      setSmallScreen();

      render(<UiCardList cardList={SMALL_CARDLIST_ARRAY} />);

      expect(screen.getAllByRole('img', HIDDEN)).toHaveLength(SMALL_CARDLIST_ARRAY.length);
      expect(screen.getByAltText(SMALL_FIRST_ALT)).toBeInTheDocument();
      expect(
        screen.getByText(content => content.includes(SMALL_FIRST_TEXT_FRAGMENT))
      ).toBeInTheDocument();
    });
  });

  describe('useMediaQuery grid-vs-swiper gating', () => {
    it('mounts only the grid variant (no swiper) when not a small screen', () => {
      setLargeScreen();

      render(<UiCardList cardList={LARGE_CARDLIST_ARRAY} />);

      expect(screen.queryByTestId('swiper')).not.toBeInTheDocument();
      expect(screen.getAllByRole('img', HIDDEN)).toHaveLength(LARGE_CARDLIST_ARRAY.length);
    });

    it('mounts only the swiper variant when on a small screen', () => {
      setSmallScreen();

      render(<UiCardList cardList={LARGE_CARDLIST_ARRAY} />);

      expect(screen.getByTestId('swiper')).toBeInTheDocument();
      // The grid variant is gated out, so the card tree is rendered exactly once.
      expect(screen.getAllByRole('img', HIDDEN)).toHaveLength(LARGE_CARDLIST_ARRAY.length);
    });
  });

  describe('tooltip composition through the real UiTooltip', () => {
    // A card carrying tooltipTitle/tooltipLabel exercises the CardContent ->
    // UiTooltip branch. The label renders as the tooltip trigger (a role="button"
    // span); activating it reveals the role="tooltip" content from real MUI.
    const tooltipCard: UiCardItemData = {
      ...SMALL_CARDLIST_ARRAY[0],
      id: 'card-with-tooltip',
      tooltipTitle: 'Helpful explanation',
      tooltipLabel: 'learn more',
    };
    const tooltipCardList: UiCardItemData[] = [tooltipCard];

    it('renders the tooltip trigger for a card with tooltipTitle/tooltipLabel', () => {
      setLargeScreen();

      render(<UiCardList cardList={tooltipCardList} />);

      const trigger: HTMLElement = screen.getByRole('button', { name: 'learn more', hidden: true });
      expect(trigger.tagName).toBe('SPAN');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('reveals the real MUI tooltip content when the trigger is activated', async () => {
      setLargeScreen();
      const user: ReturnType<typeof userEvent.setup> = userEvent.setup();

      render(<UiCardList cardList={tooltipCardList} />);

      const trigger: HTMLElement = screen.getByRole('button', { name: 'learn more', hidden: true });
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      const tooltip: HTMLElement = await screen.findByRole('tooltip', HIDDEN);
      expect(within(tooltip).getByText('Helpful explanation')).toBeInTheDocument();
    });
  });
});
