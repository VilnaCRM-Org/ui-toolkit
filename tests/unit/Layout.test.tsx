import { render, screen } from '@testing-library/react';
import React from 'react';

import { Layout } from '../../src/components';

describe('Layout', () => {
  beforeEach(() => {
    // Reset metadata before each test so a prior test's unmount restore
    // (Layout reverts title/description on cleanup) can't bleed across cases.
    document.head.querySelectorAll('meta[name="description"]').forEach(node => node.remove());
    document.title = '';
  });

  it('renders header, children, and footer in order', () => {
    const { container } = render(
      <Layout header={<header data-testid="header" />} footer={<footer data-testid="footer" />}>
        <main data-testid="content">Content</main>
      </Layout>
    );

    const header: HTMLElement = screen.getByTestId('header');
    const content: HTMLElement = screen.getByTestId('content');
    const footer: HTMLElement = screen.getByTestId('footer');

    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    expect(header.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(content.compareDocumentPosition(footer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(container).toHaveTextContent('Content');
  });

  it('updates document title and creates the meta description when provided', () => {
    render(
      <Layout pageTitle="Toolkit Page" metaDescription="Toolkit description">
        <div />
      </Layout>
    );

    expect(document.title).toBe('Toolkit Page');

    const metas: NodeListOf<HTMLMetaElement> = document.querySelectorAll(
      'meta[name="description"]'
    );
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

    const metas: NodeListOf<HTMLMetaElement> = document.querySelectorAll(
      'meta[name="description"]'
    );
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
    expect(document.querySelector('meta[name="description"]')).toBeNull();
  });
});
