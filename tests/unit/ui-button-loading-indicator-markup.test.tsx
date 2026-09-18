import { render, screen } from '@testing-library/react';
import React from 'react';

import UiButton from '../../src/components/ui-button';

import { testText } from './constants';

const emotionCssFor = (element: HTMLElement): string => {
  const emotionClass: string | undefined = Array.from(element.classList).find(
    (className: string): boolean => className.startsWith('css-')
  );
  if (!emotionClass) {
    return '';
  }
  let css: string = '';
  // eslint-disable-next-line testing-library/no-node-access
  Array.from(document.querySelectorAll('style')).forEach((styleEl: Element): void => {
    const sheet: CSSStyleSheet | null = (styleEl as HTMLStyleElement).sheet;
    if (!sheet) {
      return;
    }
    Array.from(sheet.cssRules).forEach((rule: CSSRule): void => {
      if (rule.cssText.includes(emotionClass)) {
        css += rule.cssText;
      }
    });
  });
  return css;
};

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
    expect(renderBusyButton()).toHaveStyle({ color: 'transparent' });
  });

  it('closes the pointer path and drops the hand cursor', () => {
    expect(renderBusyButton()).toHaveStyle({ pointerEvents: 'none', cursor: 'default' });
  });

  it('paints the contained spinner white over the brand fill', () => {
    const css: string = emotionCssFor(renderBusyButton());
    expect(css).toMatch(/\.MuiButton-contained \.MuiCircularProgress-root\s*\{\s*color:\s*#fff/i);
  });

  it('carries the busy paint on the outlined variant as well', () => {
    expect(renderBusyButton('outlined')).toHaveStyle({
      color: 'transparent',
      pointerEvents: 'none',
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
