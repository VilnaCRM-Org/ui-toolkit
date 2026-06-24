import { render, screen } from '@testing-library/react';
import React from 'react';

import { UiToolbar } from '../../src/components';

import { testText } from './constants';

describe('UiToolbar', () => {
  it('renders the Toolbar with the children', () => {
    render(<UiToolbar>{testText}</UiToolbar>);
    const toolbarElement: HTMLElement = screen.getByText(testText);
    expect(toolbarElement).toBeInTheDocument();
  });
});
