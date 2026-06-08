import { render, screen } from '@testing-library/react';
import React from 'react';

import { UiContainer } from '../../src/components';

describe('UiContainer', () => {
  it('renders children inside the shared container wrapper', () => {
    render(
      <UiContainer>
        <div>Container content</div>
      </UiContainer>
    );

    const container = screen.getByLabelText('container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent('Container content');
  });
});
