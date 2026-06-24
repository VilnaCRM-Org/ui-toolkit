import { render, screen } from '@testing-library/react';
import React from 'react';

import UiCardItem from '../../src/components/ui-card-item';
import CardContent from '../../src/components/ui-card-item/card-content';
import { LARGE_CARD_ITEM, SMALL_CARD_ITEM } from '../../src/components/ui-card-item/constants';

import { cardItem, largeCard, smallCard } from './constants';

const cardTitleRole: string = 'heading';

describe('UiCardItem Component', () => {
  describe('CardContent', () => {
    const integrateText: string = 'Integrate';
    const servicesText: string = 'services';

    it('renders correctly with large card', () => {
      render(<CardContent item={cardItem} isSmallCard={false} />);

      const titleElement: HTMLElement = screen.getByRole(cardTitleRole);
      const textElement: HTMLElement = screen.getByText(cardItem.text);

      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent(cardItem.title);
      expect(textElement).toBeInTheDocument();
    });

    it('renders correctly with small card', () => {
      render(<CardContent item={cardItem} isSmallCard />);

      const titleElement: HTMLElement = screen.getByRole(cardTitleRole);
      const integrateElement: HTMLElement = screen.getByText(integrateText);
      const servicesElement: HTMLElement = screen.getByText(servicesText);

      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent(cardItem.title);
      expect(integrateElement).toBeInTheDocument();
      expect(servicesElement).toBeInTheDocument();
    });

    it('renders the services disclosure without nested controls or nested <p>', () => {
      const consoleError: jest.SpyInstance = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<CardContent item={cardItem} isSmallCard />);

      // No <a> wrapping the trigger (it is the tooltip's role="button" span).
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.getByText(servicesText).tagName).toBe('SPAN');

      // React logs invalid DOM nesting (e.g. <p> inside <p>) via console.error.
      const nestingErrors: unknown[][] = consoleError.mock.calls.filter(([message]) =>
        typeof message === 'string'
          ? /cannot (be a descendant|contain)|validateDOMNesting/i.test(message)
          : false
      );
      expect(nestingErrors).toHaveLength(0);

      consoleError.mockRestore();
    });

    it('honors a heading element override for the card title', () => {
      render(<CardContent item={cardItem} isSmallCard={false} headingComponent="h2" />);

      const titleElement: HTMLElement = screen.getByRole(cardTitleRole, { level: 2 });

      expect(titleElement.tagName).toBe('H2');
      expect(titleElement).toHaveTextContent(cardItem.title);
    });
  });
});
describe('UiCardItem', () => {
  it('renders UiCardItem with small card style', () => {
    render(<UiCardItem item={smallCard} />);

    // The heading proves the card wrapper rendered its content.
    expect(screen.getByRole(cardTitleRole)).toBeInTheDocument();
    expect(screen.getByText('services')).toBeInTheDocument();
    expect(screen.queryByText(smallCard.text)).not.toBeInTheDocument();
  });

  it('renders UiCardItem with large card style', () => {
    render(<UiCardItem item={largeCard} />);

    // The heading proves the card wrapper rendered its content.
    expect(screen.getByRole(cardTitleRole)).toBeInTheDocument();
    expect(screen.getByText(largeCard.text)).toBeInTheDocument();
    expect(screen.queryByText('services')).not.toBeInTheDocument();
  });

  it('renders correct UiImage', () => {
    render(<UiCardItem item={cardItem} />);

    const cardImage: HTMLElement = screen.getByRole('img');

    expect(cardImage).toBeInTheDocument();
    expect(cardImage).toHaveAttribute('alt', cardItem.alt);
  });
});

describe('UiCardItem exported fixtures', () => {
  const cardTitleRole2: string = 'heading';

  it('renders SMALL_CARD_ITEM as a small card with translated content', () => {
    expect(SMALL_CARD_ITEM.type).toBe('smallCard');

    render(<UiCardItem item={SMALL_CARD_ITEM} />);

    // Title key resolves via i18n and the small variant uses the bodyText16 body copy.
    expect(screen.getByRole(cardTitleRole2)).toHaveTextContent('Public API');
    expect(
      screen.getByText(/For cases when you did not find the desired ready-made integration/)
    ).toBeInTheDocument();
    // alt key resolves to the localized image description.
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Image of Ruby');
  });

  it('renders LARGE_CARD_ITEM as a large card with translated content', () => {
    expect(LARGE_CARD_ITEM.type).toBe('largeCard');

    render(<UiCardItem item={LARGE_CARD_ITEM} />);

    // Large variant renders the title and text keys directly (no "services" trigger).
    expect(screen.getByRole(cardTitleRole2)).toHaveTextContent('Ready templates');
    expect(screen.queryByText('services')).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Image card of templates');
  });
});

describe('CardContent typography variants per card size', () => {
  const headingRole: string = 'heading';

  it('uses the h5 title variant for large cards', (): void => {
    render(<CardContent item={cardItem} isSmallCard={false} />);

    const title: HTMLElement = screen.getByRole(headingRole);

    // Empty-string variant mutation drops the MuiTypography-h5 class and its size.
    expect(title.className).toMatch(/MuiTypography-h5/);
    expect(title).toHaveStyle({ fontSize: '1.75rem' });
  });

  it('uses the h6 title variant for small cards', (): void => {
    render(<CardContent item={cardItem} isSmallCard />);

    const title: HTMLElement = screen.getByRole(headingRole);

    // Empty-string variant mutation drops the MuiTypography-h6 class and its size.
    expect(title.className).toMatch(/MuiTypography-h6/);
    expect(title).toHaveStyle({ fontSize: '1.375rem' });
  });

  it('uses the bodyText18 body variant for large cards', (): void => {
    render(<CardContent item={cardItem} isSmallCard={false} />);

    const body: HTMLElement = screen.getByText(cardItem.text);

    // Empty-string variant mutation drops MuiTypography-bodyText18 and its size.
    expect(body.className).toMatch(/MuiTypography-bodyText18/);
    expect(body).toHaveStyle({ fontSize: '1.125rem' });
  });

  it('uses the bodyText16 body variant for small cards', (): void => {
    render(<CardContent item={cardItem} isSmallCard />);

    // The outer body paragraph carries the leading "Integrate" copy.
    const body: HTMLElement = screen.getByText(/Integrate/);

    expect(body.tagName).toBe('P');
    // Empty-string variant mutation drops MuiTypography-bodyText16 and its size.
    expect(body.className).toMatch(/MuiTypography-bodyText16/);
    expect(body).toHaveStyle({ fontSize: '1rem' });
  });
});
