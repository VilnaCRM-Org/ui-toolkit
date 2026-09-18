import { render, screen } from '@testing-library/react';
import React from 'react';

import UiButton from '../../src/components/ui-button';

import { testText } from './constants';
import { emotionCssFor } from './utils/emotion-css';

const renderBusyButton = (variant: 'contained' | 'outlined' = 'contained'): HTMLElement => {
  render(
    <UiButton variant={variant} loading>
      {testText}
    </UiButton>
  );
  return screen.getByRole('button', { name: testText });
};

const getSpinnerBox = (): HTMLElement =>
  // eslint-disable-next-line testing-library/no-node-access
  screen.getByRole('progressbar', { hidden: true }).parentElement as HTMLElement;

describe('UiButton busy paint', () => {
  it('hides only the label ink', () => {
    expect(renderBusyButton()).toHaveStyle({ color: 'rgba(0, 0, 0, 0)' });
  });

  it('closes the pointer path and drops the hand cursor', () => {
    expect(renderBusyButton()).toHaveStyle({ 'pointer-events': 'none', cursor: 'default' });
  });

  it('paints the contained spinner white over the brand fill', () => {
    const css: string = emotionCssFor(renderBusyButton());
    expect(css).toMatch(/\.MuiButton-contained \.MuiCircularProgress-root\s*\{\s*color:\s*#fff/i);
  });

  it('carries the busy paint on the outlined variant as well', () => {
    expect(renderBusyButton('outlined')).toHaveStyle({
      color: 'rgba(0, 0, 0, 0)',
      'pointer-events': 'none',
      cursor: 'default',
    });
  });
});

describe('UiButton spinner box', () => {
  it('is positioned over the label', () => {
    renderBusyButton();
    const css: string = emotionCssFor(getSpinnerBox());
    expect(css).toMatch(/position:\s*absolute/);
    expect(css).toMatch(/display:\s*inline-flex/);
  });

  it('is centred on both axes', () => {
    renderBusyButton();
    const css: string = emotionCssFor(getSpinnerBox());
    expect(css).toMatch(/top:\s*50%/);
    expect(css).toMatch(/left:\s*50%/);
    expect(css).toMatch(/transform:\s*translate\(-50%,\s*-50%\)/);
  });
});
