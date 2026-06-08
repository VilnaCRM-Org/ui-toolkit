import { render, screen } from '@testing-library/react';
import React from 'react';

import { Layout } from '../../src/components';

describe('Layout', () => {
  it('renders header, children, and footer in order', () => {
    const { container } = render(
      <Layout
        header={<header data-testid="header" />}
        footer={<footer data-testid="footer" />}
      >
        <main data-testid="content">Content</main>
      </Layout>
    );

    const header = screen.getByTestId('header');
    const content = screen.getByTestId('content');
    const footer = screen.getByTestId('footer');

    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    expect(header.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(content.compareDocumentPosition(footer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(container.textContent).toContain('Content');
  });

  it('updates document title and meta description when provided', () => {
    render(
      <Layout pageTitle="Toolkit Page" metaDescription="Toolkit description">
        <div />
      </Layout>
    );

    expect(document.title).toBe('Toolkit Page');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Toolkit description'
    );
  });
});
