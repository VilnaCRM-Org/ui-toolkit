import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  Layout,
  UiButton,
  UiContainer,
  UiFooter,
  UiToolbar,
  UiTypography,
} from '../../../src/components';

// Resolved English strings from i18n/localization.json (i18n is initialised
// globally in jest.setup, so the real children translate their keys).
const COPYRIGHT_TEXT: string = 'Copyright © ТОВ “Vilna CRM”';
const PRIVACY_LABEL: string = 'Privacy policy';
const INSTAGRAM_LABEL: string = 'Link to Instagram';

const HEADER_HEADING: string = 'Vilna Toolkit';
const PAGE_HEADING: string = 'Dashboard';
const ACTION_LABEL: string = 'Continue';

// A genuinely composed header subtree built from REAL toolkit components (no
// mocks). The <header> element gives it a `banner` landmark to query by role.
function RealHeader(): React.ReactElement {
  return (
    <header>
      <UiToolbar>
        <UiTypography variant="h2" component="h1">
          {HEADER_HEADING}
        </UiTypography>
      </UiToolbar>
    </header>
  );
}

// Real composed children: a container wrapping a heading and an interactive
// button, so the integration also exercises a real focusable control.
function RealChildren(): React.ReactElement {
  return (
    <main>
      <UiContainer>
        <UiTypography variant="h3" component="h2">
          {PAGE_HEADING}
        </UiTypography>
        <UiButton type="button">{ACTION_LABEL}</UiButton>
      </UiContainer>
    </main>
  );
}

function renderLayout(
  props: Partial<React.ComponentProps<typeof Layout>> = {}
): ReturnType<typeof render> {
  return render(
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Layout header={<RealHeader />} footer={<UiFooter />} {...props}>
      <RealChildren />
    </Layout>
  );
}

// <meta name="description"> lives in <head>, outside the RTL render container, so Testing
// Library queries cannot reach it; direct document access is the only way to assert this
// document-level metadata side effect.
function metaDescriptionTags(): HTMLMetaElement[] {
   
  return Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="description"]'));
}

function firstMetaDescription(): HTMLMetaElement | null {
  return metaDescriptionTags()[0] ?? null;
}

describe('Layout (integration)', () => {
  beforeEach(() => {
    // Reset metadata so a prior test's unmount-restore can't bleed across cases.
    metaDescriptionTags().forEach(node => node.remove());
    document.title = '';
  });

  it('renders the real header, footer and children together as one document', () => {
    renderLayout();

    // Real header subtree (UiToolbar -> UiTypography) resolved its content.
    const banner: HTMLElement = screen.getByRole('banner');
    expect(within(banner).getByRole('heading', { name: HEADER_HEADING })).toBeInTheDocument();

    // Real children subtree rendered with its real heading and button.
    expect(screen.getByRole('heading', { name: PAGE_HEADING })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ACTION_LABEL })).toBeInTheDocument();

    // Real UiFooter subtree resolved its i18n-driven content (copyright + links).
    const footer: HTMLElement = screen.getByRole('contentinfo');
    expect(within(footer).getAllByText(new RegExp(COPYRIGHT_TEXT)).length).toBeGreaterThan(0);
    expect(within(footer).getAllByRole('link', { name: PRIVACY_LABEL }).length).toBeGreaterThan(0);
    expect(within(footer).getAllByRole('link', { name: INSTAGRAM_LABEL }).length).toBeGreaterThan(
      0
    );
  });

  it('renders header, then children, then footer in source order', () => {
    renderLayout();

    const banner: HTMLElement = screen.getByRole('banner');
    const main: HTMLElement = screen.getByRole('main');
    const footer: HTMLElement = screen.getByRole('contentinfo');

    expect(banner.compareDocumentPosition(main)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(main.compareDocumentPosition(footer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('sets document.title and upserts the meta description from the props', () => {
    renderLayout({ pageTitle: 'Toolkit Dashboard', metaDescription: 'Composed toolkit page' });

    expect(document.title).toBe('Toolkit Dashboard');

    const metas: HTMLMetaElement[] = metaDescriptionTags();
    expect(metas).toHaveLength(1);
    expect(metas[0]).toHaveAttribute('content', 'Composed toolkit page');

    // Side effects coexist with the real composed subtrees.
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('updates an existing meta description tag instead of duplicating it', () => {
    const existing: HTMLMetaElement = document.createElement('meta');
    existing.setAttribute('name', 'description');
    existing.setAttribute('content', 'pre-existing description');
    document.head.appendChild(existing);

    renderLayout({ metaDescription: 'overwritten by Layout' });

    const metas: HTMLMetaElement[] = metaDescriptionTags();
    expect(metas).toHaveLength(1);
    expect(metas[0]).toHaveAttribute('content', 'overwritten by Layout');
  });

  it('restores title and removes the created meta description on unmount', () => {
    document.title = 'Original Title';

    const { unmount } = renderLayout({
      pageTitle: 'Temporary Title',
      metaDescription: 'temporary description',
    });

    expect(document.title).toBe('Temporary Title');
    expect(firstMetaDescription()).toHaveAttribute('content', 'temporary description');

    unmount();

    expect(document.title).toBe('Original Title');
    expect(firstMetaDescription()).toBeNull();
  });

  it('restores a pre-existing meta description content on unmount', () => {
    const existing: HTMLMetaElement = document.createElement('meta');
    existing.setAttribute('name', 'description');
    existing.setAttribute('content', 'original description');
    document.head.appendChild(existing);

    const { unmount } = renderLayout({ metaDescription: 'temporary description' });

    expect(firstMetaDescription()).toHaveAttribute('content', 'temporary description');

    unmount();

    expect(firstMetaDescription()).toHaveAttribute('content', 'original description');
  });

  it('re-runs the metadata effect when title/description props change', () => {
    const { rerender } = render(
      <Layout
        header={<RealHeader />}
        footer={<UiFooter />}
        pageTitle="First Title"
        metaDescription="first description"
      >
        <RealChildren />
      </Layout>
    );

    expect(document.title).toBe('First Title');
    expect(firstMetaDescription()).toHaveAttribute('content', 'first description');

    rerender(
      <Layout
        header={<RealHeader />}
        footer={<UiFooter />}
        pageTitle="Second Title"
        metaDescription="second description"
      >
        <RealChildren />
      </Layout>
    );

    expect(document.title).toBe('Second Title');
    expect(firstMetaDescription()).toHaveAttribute('content', 'second description');

    // Real composed children still rendered across the re-run.
    expect(screen.getByRole('heading', { name: PAGE_HEADING })).toBeInTheDocument();
  });

  it('keeps the real children interactive while metadata side effects run', async () => {
    const user: ReturnType<typeof userEvent.setup> = userEvent.setup();
    const onClick: jest.Mock = jest.fn();

    render(
      <Layout
        header={<RealHeader />}
        footer={<UiFooter />}
        pageTitle="Interactive Page"
        metaDescription="interactive description"
      >
        <main>
          <UiContainer>
            <UiButton type="button" onClick={onClick}>
              {ACTION_LABEL}
            </UiButton>
          </UiContainer>
        </main>
      </Layout>
    );

    expect(document.title).toBe('Interactive Page');

    await user.click(screen.getByRole('button', { name: ACTION_LABEL }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Layout metadata cleanup edge case', () => {
  it('does not throw on unmount when the created meta was already removed', () => {
    metaDescriptionTags().forEach(node => node.remove());

    const { unmount } = renderLayout({ metaDescription: 'temporary description' });
    expect(firstMetaDescription()).not.toBeNull();

    // External removal before unmount: the cleanup's `?.remove()` must no-op on
    // the now-null query (the optional-chaining null branch).
    metaDescriptionTags().forEach(node => node.remove());

    expect(() => unmount()).not.toThrow();
    expect(firstMetaDescription()).toBeNull();
  });
});
