import { render } from '@testing-library/react';
import React from 'react';

import { GhostOverlay } from '../../src/components/ghost-overlay';

describe('GhostOverlay', () => {
  it('renders the typed prefix and the grey completion as separate runs', () => {
    const { container } = render(<GhostOverlay typed="Top" completion=" performers" />);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const runs = [...container.querySelectorAll('.ui-ghost-run')].map(s => s.textContent);
    // A transparent typed mirror, then the grey completion.
    expect(runs).toEqual(['Top', ' performers']);
  });

  it('is hidden from assistive technology so the completion is never announced', () => {
    const { container } = render(<GhostOverlay typed="Top" completion=" performers" />);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const root = container.querySelector('.ui-ghost-overlay');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveTextContent('Top performers');
  });

  it('draws no custom caret — the input keeps its own native caret', () => {
    const { container } = render(<GhostOverlay typed="Top" completion=" performers" />);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('.ui-ghost-caret')).toBeNull();
  });

  it('renders nothing when there is no completion', () => {
    const { container } = render(<GhostOverlay typed="Top performers" completion="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
