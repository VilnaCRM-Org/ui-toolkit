import { render, screen } from '@testing-library/react';
import React from 'react';

import { Layout } from '../../src/components';

// `<title>` and `<meta name="description">` live in document.head, which
// Testing Library's body-scoped `screen` queries cannot reach and for which no
// semantic query exists. These helpers isolate the unavoidable head access so
// the node-access escape hatch lives in exactly one place per operation.

function getDescriptionMetas(): HTMLMetaElement[] {
  return Array.from(document.head.querySelectorAll<HTMLMetaElement>('meta[name="description"]'));
}

function getDescriptionMeta(): HTMLMetaElement | null {
  return getDescriptionMetas()[0] ?? null;
}

function getDescriptionContent(): string | null {
  return getDescriptionMeta()?.getAttribute('content') ?? null;
}

describe('Layout', () => {
  beforeEach(() => {
    // Reset metadata before each test so a prior test's unmount restore
    // (Layout reverts title/description on cleanup) can't bleed across cases.
    getDescriptionMetas().forEach(node => node.remove());
    document.title = '';
  });

  it('renders header, children, and footer in order', () => {
    render(
      <Layout header={<header>Header</header>} footer={<footer>Footer</footer>}>
        <main>Content</main>
      </Layout>
    );

    const header: HTMLElement = screen.getByRole('banner');
    const content: HTMLElement = screen.getByRole('main');
    const footer: HTMLElement = screen.getByRole('contentinfo');

    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    expect(header.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(content.compareDocumentPosition(footer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('updates document title and creates the meta description when provided', () => {
    render(
      <Layout pageTitle="Toolkit Page" metaDescription="Toolkit description">
        <div />
      </Layout>
    );

    expect(document.title).toBe('Toolkit Page');

    const metas: HTMLMetaElement[] = getDescriptionMetas();
    expect(metas).toHaveLength(1);
    expect(metas[0]).toHaveAttribute('content', 'Toolkit description');
  });

  it('reuses an existing meta description tag instead of creating a duplicate', () => {
    const existing: HTMLMetaElement = document.createElement('meta');
    existing.setAttribute('name', 'description');
    existing.setAttribute('content', 'original');
    document.head.appendChild(existing);

    render(
      <Layout metaDescription="updated description">
        <div />
      </Layout>
    );

    const metas: HTMLMetaElement[] = getDescriptionMetas();
    expect(metas).toHaveLength(1);
    expect(metas[0]).toHaveAttribute('content', 'updated description');
  });

  it('does not touch document title or meta description when no props are provided', () => {
    document.title = 'untouched';

    render(
      <Layout>
        <div />
      </Layout>
    );

    expect(document.title).toBe('untouched');
    expect(getDescriptionMeta()).toBeNull();
  });

  it('restores the previous document title when unmounted', () => {
    document.title = 'Original Title';

    const { unmount } = render(
      <Layout pageTitle="Toolkit Page">
        <div />
      </Layout>
    );

    expect(document.title).toBe('Toolkit Page');

    unmount();

    expect(document.title).toBe('Original Title');
  });

  it('restores the previous meta description content when unmounted', () => {
    const existing: HTMLMetaElement = document.createElement('meta');
    existing.setAttribute('name', 'description');
    existing.setAttribute('content', 'original description');
    document.head.appendChild(existing);

    const { unmount } = render(
      <Layout metaDescription="temporary description">
        <div />
      </Layout>
    );

    expect(getDescriptionContent()).toBe('temporary description');

    unmount();

    expect(getDescriptionContent()).toBe('original description');
  });

  it('removes the created meta description when unmounted and none existed before', () => {
    const { unmount } = render(
      <Layout metaDescription="temporary description">
        <div />
      </Layout>
    );

    expect(getDescriptionContent()).toBe('temporary description');

    unmount();

    expect(getDescriptionMeta()).toBeNull();
  });

  it('does not throw on unmount when the created meta description was removed externally', () => {
    const { unmount } = render(
      <Layout metaDescription="temporary description">
        <div />
      </Layout>
    );

    const created: HTMLMetaElement | null = getDescriptionMeta();
    expect(created).toHaveAttribute('content', 'temporary description');

    // Simulate an external actor stripping the meta tag before Layout's cleanup
    // runs, so querySelector returns null and the optional chain short-circuits.
    created?.remove();

    expect(() => unmount()).not.toThrow();
    expect(getDescriptionMeta()).toBeNull();
  });

  it('leaves the document title untouched on unmount when no pageTitle is provided', () => {
    document.title = 'persisted';

    const { unmount } = render(
      <Layout metaDescription="some description">
        <div />
      </Layout>
    );

    unmount();

    expect(document.title).toBe('persisted');
  });

  it('re-applies the title and meta description when the props change', () => {
    const { rerender } = render(
      <Layout pageTitle="First Title" metaDescription="first description">
        <div />
      </Layout>
    );

    expect(document.title).toBe('First Title');
    expect(getDescriptionContent()).toBe('first description');

    rerender(
      <Layout pageTitle="Second Title" metaDescription="second description">
        <div />
      </Layout>
    );

    expect(document.title).toBe('Second Title');
    expect(getDescriptionContent()).toBe('second description');
  });
});

describe('Layout cleanup runs conditionally on the provided props', () => {
  beforeEach((): void => {
    // Mirror the suite-level reset so a prior test's unmount restore can't bleed
    // across cases when this block runs in isolation.
    getDescriptionMetas().forEach((node: HTMLMetaElement): void => node.remove());
    document.title = '';
  });

  it('does not restore the title on unmount when no pageTitle was provided', (): void => {
    document.title = 'effect-time title';

    const { unmount } = render(
      <Layout metaDescription="some description">
        <div />
      </Layout>
    );

    // Change the title after mount. With no pageTitle, the cleanup branch is
    // skipped, so the title must keep this post-mount value. If the cleanup
    // guard were always-true it would revert to the effect-time title.
    document.title = 'changed after mount';

    unmount();

    expect(document.title).toBe('changed after mount');
  });

  it('keeps an externally added meta on unmount when no metaDescription was provided', (): void => {
    const { unmount } = render(
      <Layout pageTitle="Some Title">
        <div />
      </Layout>
    );

    // No meta existed at effect time (captured previousDescription is null). Add
    // one after mount. With no metaDescription, the cleanup branch is skipped, so
    // this tag must survive. If the cleanup guard were always-true the null-branch
    // would run and remove it.
    const added: HTMLMetaElement = document.createElement('meta');
    added.setAttribute('name', 'description');
    added.setAttribute('content', 'externally added');
    document.head.appendChild(added);

    unmount();

    const meta: HTMLMetaElement | null = getDescriptionMeta();
    expect(meta).not.toBeNull();
    expect(meta).toHaveAttribute('content', 'externally added');
  });
});
