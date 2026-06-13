import { render, screen, within } from '@testing-library/react';
import React from 'react';

import CardContent from '../../src/components/UiCardList/CardContent';
import { UiCardItemData } from '../../src/components/UiCardList/types';
import UiCardItem from '../../src/components/UiCardList/UiCardItem';

// These tests render the local parity `CardContent` and `UiCardItem` directly
// (no child mocks) so every branch of the title/text/tooltip rendering and the
// small-vs-large layout selection is exercised against the real subtree. i18n is
// initialised globally in jest.setup, so `Trans`/`useTranslation` resolve keys.

const baseSmallItem: UiCardItemData = {
  type: 'smallCard',
  id: 'small-1',
  imageSrc: 'https://example.com/small.png',
  title: 'why_us.headers.header_open_source',
  text: 'why_us.texts.text_open_source',
  alt: 'why_us.alt_image.alt_open_source',
};

const baseLargeItem: UiCardItemData = {
  type: 'largeCard',
  id: 'large-1',
  imageSrc: 'https://example.com/large.png',
  title: 'why_us.headers.header_ready_templates',
  text: 'why_us.texts.text_you_have_store',
  alt: 'why_us.alt_image.alt_ready_templates',
};

describe('CardContent component', () => {
  it('renders translated string title and text for a small card', () => {
    render(<CardContent item={baseSmallItem} isSmallCard />);

    expect(screen.getByText('Open source')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Thanks to the open source code, you can modify and add CRM functions as you need them'
      )
    ).toBeInTheDocument();
  });

  it('renders ReactNode title and text verbatim instead of translating them', () => {
    const item: UiCardItemData = {
      ...baseSmallItem,
      title: <span data-node="title">Custom title node</span>,
      text: <span data-node="text">Custom text node</span>,
    };

    render(<CardContent item={item} isSmallCard={false} />);

    expect(screen.getByText('Custom title node')).toBeInTheDocument();
    expect(screen.getByText('Custom text node')).toBeInTheDocument();
  });

  it('defaults the title heading element to h3 when no headingComponent is given', () => {
    render(<CardContent item={baseSmallItem} isSmallCard />);

    const heading: HTMLElement = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Open source');
  });

  it('renders the title with the provided headingComponent override', () => {
    render(<CardContent item={baseSmallItem} isSmallCard headingComponent="h2" />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Open source');
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });

  it('renders the tooltip label alongside the text when tooltip props are present', () => {
    const item: UiCardItemData = {
      ...baseSmallItem,
      text: 'Body text',
      tooltipTitle: 'Tooltip title',
      tooltipLabel: 'Tooltip label',
    };

    render(<CardContent item={item} isSmallCard />);

    expect(screen.getByText('Body text')).toBeInTheDocument();
    expect(screen.getByText('Tooltip label')).toBeInTheDocument();
  });

  it('omits the tooltip when tooltipTitle is missing', () => {
    const item: UiCardItemData = {
      ...baseSmallItem,
      text: 'Body only',
      tooltipLabel: 'Orphan label',
    };

    render(<CardContent item={item} isSmallCard />);

    expect(screen.getByText('Body only')).toBeInTheDocument();
    expect(screen.queryByText('Orphan label')).not.toBeInTheDocument();
  });

  it('omits the tooltip when tooltipLabel is missing', () => {
    const item: UiCardItemData = {
      ...baseSmallItem,
      text: 'Body only',
      tooltipTitle: 'Orphan title',
    };

    render(<CardContent item={item} isSmallCard />);

    expect(screen.getByText('Body only')).toBeInTheDocument();
    expect(screen.queryByText('Orphan title')).not.toBeInTheDocument();
  });
});

describe('UiCardItem component', () => {
  it('renders the image with a translated alt for a small card', () => {
    render(<UiCardItem item={baseSmallItem} />);

    expect(screen.getByAltText('Image card of open source')).toBeInTheDocument();
  });

  it('renders title and text content for a small card', () => {
    render(<UiCardItem item={baseSmallItem} />);

    expect(screen.getByRole('heading', { name: 'Open source' })).toBeInTheDocument();
  });

  it('renders a large card and forwards the headingComponent override to the title', () => {
    render(<UiCardItem item={baseLargeItem} headingComponent="h4" />);

    const heading: HTMLElement = screen.getByRole('heading', { level: 4 });
    expect(heading).toHaveTextContent('Ready templates');
    expect(screen.getByAltText('Image card of templates')).toBeInTheDocument();
  });

  it('renders both image and heading inside a single card subtree', () => {
    const { container } = render(<UiCardItem item={baseSmallItem} />);
    const card: HTMLElement = container.firstChild as HTMLElement;

    expect(within(card).getByRole('heading', { name: 'Open source' })).toBeInTheDocument();
    expect(within(card).getByRole('img')).toBeInTheDocument();
  });
});
