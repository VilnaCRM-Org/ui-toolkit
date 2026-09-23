import { render, screen } from '@testing-library/react';
import React from 'react';

import UiToolbar from '../../src/components/ui-toolbar';

import { testText } from './constants';

describe('UiToolbar', () => {
  it('renders the Toolbar with the children', () => {
    render(<UiToolbar>{testText}</UiToolbar>);
    const toolbarElement: HTMLElement = screen.getByText(testText);
    expect(toolbarElement).toBeInTheDocument();
  });

  it('applies the toolkit toolbar layout without a provider', () => {
    render(<UiToolbar>{testText}</UiToolbar>);

    expect(screen.getByText(testText)).toHaveStyle({
      justifyContent: 'space-between',
      margin: '0px',
    });
  });
});
