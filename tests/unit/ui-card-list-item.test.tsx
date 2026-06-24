import { render, screen } from '@testing-library/react';
import React from 'react';

import CardContent from '../../src/components/ui-card-list/card-content';
import { UiCardItemData } from '../../src/components/ui-card-list/types';
import UiCardItem from '../../src/components/ui-card-list/ui-card-item';

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
    render(<UiCardItem item={baseSmallItem} />);

    expect(screen.getByRole('heading', { name: 'Open source' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Image card of open source' })).toBeInTheDocument();
  });
});

describe('CardContent typography-variant selection', () => {
  const smallVariantItem: UiCardItemData = {
    type: 'smallCard',
    id: 'variant-small',
    imageSrc: 'https://example.com/small.png',
    title: 'why_us.headers.header_open_source',
    text: 'why_us.texts.text_open_source',
    alt: 'why_us.alt_image.alt_open_source',
  };
  const largeVariantItem: UiCardItemData = {
    type: 'largeCard',
    id: 'variant-large',
    imageSrc: 'https://example.com/large.png',
    title: 'why_us.headers.header_ready_templates',
    text: 'why_us.texts.text_configure_system',
    alt: 'why_us.alt_image.alt_ready_templates',
  };
  const smallBodyText: string =
    'Thanks to the open source code, you can modify and add CRM functions as you need them';
  const largeBodyText: string =
    'Configure the system in a few clicks without programming knowledge' +
    ' and receive orders from your website in a few minutes';

  it('uses the h6 title and bodyText16 body variants for a small card', (): void => {
    render(<CardContent item={smallVariantItem} isSmallCard />);

    const heading: HTMLElement = screen.getByRole('heading', { name: 'Open source' });
    expect(heading.className).toMatch(/MuiTypography-h6/);
    expect(heading.className).not.toMatch(/MuiTypography-h5/);
    expect(heading).toHaveStyle({ fontSize: '1.375rem' });

    const body: HTMLElement = screen.getByText(smallBodyText);
    expect(body.className).toMatch(/MuiTypography-bodyText16/);
    expect(body.className).not.toMatch(/MuiTypography-bodyText18/);
    expect(body).toHaveStyle({ fontSize: '1rem' });
  });

  it('uses the h5 title and bodyText18 body variants for a large card', (): void => {
    render(<CardContent item={largeVariantItem} isSmallCard={false} />);

    const heading: HTMLElement = screen.getByRole('heading', { name: 'Ready templates' });
    expect(heading.className).toMatch(/MuiTypography-h5/);
    expect(heading.className).not.toMatch(/MuiTypography-h6/);
    expect(heading).toHaveStyle({ fontSize: '1.75rem' });

    const body: HTMLElement = screen.getByText(largeBodyText);
    expect(body.className).toMatch(/MuiTypography-bodyText18/);
    expect(body.className).not.toMatch(/MuiTypography-bodyText16/);
    expect(body).toHaveStyle({ fontSize: '1.125rem' });
  });

  it('renders an array ReactNode text verbatim instead of wrapping it in Trans', (): void => {
    const arrayText: React.ReactNode = ['First ', <strong key="frag">bold</strong>, ' last'];
    render(<CardContent item={{ ...smallVariantItem, text: arrayText }} isSmallCard />);

    const fragment: HTMLElement = screen.getByText('bold');
    expect(fragment.tagName).toBe('STRONG');
    // eslint-disable-next-line testing-library/no-node-access -- assert array siblings
    expect(fragment.parentElement).toHaveTextContent('First bold last');
  });

  it('renders an array ReactNode title verbatim instead of wrapping it in Trans', (): void => {
    const arrayTitle: React.ReactNode = ['Alpha ', <em key="frag">beta</em>];
    render(<CardContent item={{ ...smallVariantItem, title: arrayTitle }} isSmallCard />);

    const heading: HTMLElement = screen.getByRole('heading');
    expect(heading).toHaveTextContent('Alpha beta');
    const emphasis: HTMLElement = screen.getByText('beta');
    expect(emphasis.tagName).toBe('EM');
  });

  it('keeps exactly one space between the body text and the tooltip label', (): void => {
    const item: UiCardItemData = {
      ...smallVariantItem,
      text: 'Body text',
      tooltipTitle: 'Tooltip title',
      tooltipLabel: 'Label',
    };
    render(<CardContent item={item} isSmallCard />);

    const label: HTMLElement = screen.getByText('Label');
    // eslint-disable-next-line testing-library/no-node-access -- reach wrapping <p>
    const paragraph: HTMLElement | null = label.closest('p');
    expect(paragraph).not.toBeNull();
    expect(paragraph?.textContent).toBe('Body text Label');
  });
});

describe('UiCardItem small-vs-large branch', () => {
  const smallItem: UiCardItemData = {
    type: 'smallCard',
    id: 'branch-small',
    imageSrc: 'https://example.com/small.png',
    title: 'why_us.headers.header_open_source',
    text: 'why_us.texts.text_open_source',
    alt: 'why_us.alt_image.alt_open_source',
  };
  const largeItem: UiCardItemData = {
    type: 'largeCard',
    id: 'branch-large',
    imageSrc: 'https://example.com/large.png',
    title: 'why_us.headers.header_ready_templates',
    text: 'why_us.texts.text_configure_system',
    alt: 'why_us.alt_image.alt_ready_templates',
  };

  it('treats a smallCard item as a small card (h6 / bodyText16)', (): void => {
    render(<UiCardItem item={smallItem} />);

    const heading: HTMLElement = screen.getByRole('heading', { name: 'Open source' });
    expect(heading.className).toMatch(/MuiTypography-h6/);
    expect(heading.className).not.toMatch(/MuiTypography-h5/);

    const body: HTMLElement = screen.getByText(
      'Thanks to the open source code, you can modify and add CRM functions as you need them'
    );
    expect(body.className).toMatch(/MuiTypography-bodyText16/);
  });

  it('treats a largeCard item as a large card (h5 / bodyText18)', (): void => {
    render(<UiCardItem item={largeItem} />);

    const heading: HTMLElement = screen.getByRole('heading', { name: 'Ready templates' });
    expect(heading.className).toMatch(/MuiTypography-h5/);
    expect(heading.className).not.toMatch(/MuiTypography-h6/);

    const body: HTMLElement = screen.getByText(
      'Configure the system in a few clicks without programming knowledge' +
        ' and receive orders from your website in a few minutes'
    );
    expect(body.className).toMatch(/MuiTypography-bodyText18/);
  });
});
