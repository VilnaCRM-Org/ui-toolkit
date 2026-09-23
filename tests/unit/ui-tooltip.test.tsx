import { ThemeProvider } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import UiTooltip from '../../src/components/ui-tooltip';
import { fontFamilies } from '../../src/utils/font-tokens';
import { createUiTheme } from '../../src/utils/ui-theme';

import { testText } from './constants';
import { emotionCssFor } from './utils/emotion-css';

const title: string = testText;
const placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
const sx: object = { color: 'red' };
const children: React.ReactNode = <div>{testText}</div>;
const triggerText: string = 'Open tooltip';
const bubbleText: string = 'Bubble text';

function openBubble(): HTMLElement {
  fireEvent.click(screen.getByRole('button', { name: triggerText }));
  return screen.getByText(bubbleText);
}

describe('UiTooltip', () => {
  it('renders the tooltip with the correct props', () => {
    render(
      <UiTooltip title={title} placement={placement} arrow sx={sx}>
        {children}
      </UiTooltip>
    );

    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it('forwards triggerLabel as the accessible name of the trigger', () => {
    render(
      <UiTooltip title={title} triggerLabel="Open details">
        <span aria-hidden>★</span>
      </UiTooltip>
    );

    expect(screen.getByRole('button', { name: 'Open details' })).toBeInTheDocument();
  });

  it('paints the toolkit defaults without a provider', () => {
    render(<UiTooltip title={bubbleText}>{triggerText}</UiTooltip>);

    const fontRule: string = `font-family: ${fontFamilies.inter}`;
    expect(emotionCssFor(screen.getByRole('button', { name: triggerText }))).toContain(fontRule);
    const bubble: HTMLElement = openBubble();
    expect(bubble).toHaveStyle({ color: 'rgb(26, 28, 30)' });
    expect(emotionCssFor(bubble)).toContain(fontRule);
  });

  it('follows a consumer theme palette', () => {
    render(
      <ThemeProvider theme={createUiTheme({ palette: { darkPrimary: { main: '#ff0000' } } })}>
        <UiTooltip title={bubbleText}>{triggerText}</UiTooltip>
      </ThemeProvider>
    );

    expect(openBubble()).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('forwards remaining MUI Tooltip props', () => {
    render(
      <UiTooltip title={bubbleText} classes={{ tooltip: 'consumer-bubble' }}>
        {triggerText}
      </UiTooltip>
    );

    expect(openBubble()).toHaveClass('consumer-bubble');
  });

  it('merges a consumer tooltip slot after the toolkit styles', () => {
    render(
      <UiTooltip
        title={bubbleText}
        slotProps={{ tooltip: { className: 'slot-bubble', sx: { color: 'rgb(0, 0, 255)' } } }}
      >
        {triggerText}
      </UiTooltip>
    );

    const bubble: HTMLElement = openBubble();
    expect(bubble).toHaveClass('slot-bubble');
    expect(bubble).toHaveStyle({ color: 'rgb(0, 0, 255)' });
  });

  it('accepts a consumer tooltip slot sx given as an array', () => {
    render(
      <UiTooltip title={bubbleText} slotProps={{ tooltip: { sx: [{ color: 'rgb(0, 128, 0)' }] } }}>
        {triggerText}
      </UiTooltip>
    );

    expect(openBubble()).toHaveStyle({ color: 'rgb(0, 128, 0)' });
  });

  it('keeps the callback form of a consumer tooltip slot working', () => {
    render(
      <UiTooltip title={bubbleText} slotProps={{ tooltip: () => ({ className: 'fn-bubble' }) }}>
        {triggerText}
      </UiTooltip>
    );

    expect(openBubble()).toHaveClass('fn-bubble');
  });
});
