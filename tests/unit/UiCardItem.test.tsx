import { render } from '@testing-library/react';
import React from 'react';

import UiCardItem from '../../src/components/UiCardItem';
import CardContent from '../../src/components/UiCardItem/CardContent';

import { cardItem, largeCard, smallCard } from './constants';

const cardTitleRole: string = 'heading';

describe('UiCardItem Component', () => {
  describe('CardContent', () => {
    const integrateText: string = 'Integrate';
    const servicesText: string = 'services';

    it('renders correctly with large card', () => {
      const { getByText, getByRole } = render(<CardContent item={cardItem} isSmallCard={false} />);

      const titleElement: HTMLElement = getByRole(cardTitleRole);
      const textElement: HTMLElement = getByText(cardItem.text);

      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent(cardItem.title);
      expect(textElement).toBeInTheDocument();
    });

    it('renders correctly with small card', () => {
      const { getByText, getByRole } = render(<CardContent item={cardItem} isSmallCard />);

      const titleElement: HTMLElement = getByRole(cardTitleRole);
      const integrateElement: HTMLElement = getByText(integrateText);
      const servicesElement: HTMLElement = getByText(servicesText);

      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent(cardItem.title);
      expect(integrateElement).toBeInTheDocument();
      expect(servicesElement).toBeInTheDocument();
    });

    it('renders the services disclosure without nested interactive controls or nested <p>', () => {
      const consoleError: jest.SpyInstance = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { queryByRole, getByText } = render(<CardContent item={cardItem} isSmallCard />);

      // No <a> wrapping the trigger (it is the tooltip's role="button" span).
      expect(queryByRole('link')).not.toBeInTheDocument();
      expect(getByText(servicesText).tagName).toBe('SPAN');

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
      const { getByRole } = render(
        <CardContent item={cardItem} isSmallCard={false} headingComponent="h2" />
      );

      const titleElement: HTMLElement = getByRole(cardTitleRole, { level: 2 });

      expect(titleElement.tagName).toBe('H2');
      expect(titleElement).toHaveTextContent(cardItem.title);
    });
  });
});
describe('UiCardItem', () => {
  const stackElementClass: string = '.MuiStack-root';

  it('renders UiCardItem with small card style', () => {
    const { container, getByText, queryByText } = render(<UiCardItem item={smallCard} />);

    const element: HTMLElement | null = container.querySelector(stackElementClass);

    expect(element).toBeInTheDocument();
    expect(getByText('services')).toBeInTheDocument();
    expect(queryByText(smallCard.text)).not.toBeInTheDocument();
  });

  it('renders UiCardItem with large card style', () => {
    const { container, getByText, queryByText } = render(<UiCardItem item={largeCard} />);

    const element: HTMLElement | null = container.querySelector(stackElementClass);

    expect(element).toBeInTheDocument();
    expect(getByText(largeCard.text)).toBeInTheDocument();
    expect(queryByText('services')).not.toBeInTheDocument();
  });

  it('renders correct UiImage', () => {
    const { getByRole } = render(<UiCardItem item={cardItem} />);

    const cardImage: HTMLElement = getByRole('img');

    expect(cardImage).toBeInTheDocument();
    expect(cardImage).toHaveAttribute('alt', cardItem.alt);
  });
});
