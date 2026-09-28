import { render, screen } from '@testing-library/react';
import React from 'react';

import UiContainer from '../../src/components/ui-container';

describe('UiContainer', () => {
  it('renders children inside the shared container wrapper', () => {
    render(
      <UiContainer>
        <div>Container content</div>
      </UiContainer>
    );

    expect(screen.getByText('Container content')).toBeInTheDocument();
  });

  it('stays a nameless generic wrapper', () => {
    render(
      <UiContainer>
        <div>Container content</div>
      </UiContainer>
    );

    expect(screen.queryByLabelText('container')).not.toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByText('Container content').parentElement).not.toHaveAttribute('aria-label');
  });
});
