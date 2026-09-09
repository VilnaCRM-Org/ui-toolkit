import { render, screen } from '@testing-library/react';
import React from 'react';

import UiSkeletonControlText from '../../src/components/ui-skeleton-control-text';
import {
  CHECKBOX_CONTROL_RADIUS,
  CONTROL_SIZE,
  CONTROL_TEXT_BAR_WIDTH,
  CONTROL_TEXT_GAP,
  DEFAULT_CONTROL,
  RADIO_CONTROL_RADIUS,
  controlShapeStyles,
  controlTextContentStyles,
  getControlRadius,
} from '../../src/components/ui-skeleton-control-text/styles';
import { DEFAULT_LOADING_TEXT } from '../../src/components/ui-skeletons';

const WIDGET_ROLES: string[] = ['checkbox', 'radio', 'button', 'link', 'textbox', 'group'];

const getRoot = (): HTMLElement => screen.getByRole('generic', { busy: true });

const getShapeTree = (): HTMLElement => {
  const hidden: HTMLElement | undefined = screen
    .getAllByRole('generic', { hidden: true })
    .find(element => element.getAttribute('aria-hidden') === 'true');
  if (!hidden) throw new Error('control+text skeleton rendered no aria-hidden shape tree');
  return hidden;
};

const findShapeByWidth = (width: string): HTMLElement => {
  const shape: HTMLElement | undefined = screen
    .getAllByRole('generic', { hidden: true })
    .find(element => window.getComputedStyle(element).width === width);
  if (!shape) throw new Error(`no skeleton shape rendered at width ${width}`);
  return shape;
};

const getControl = (): HTMLElement => findShapeByWidth(CONTROL_SIZE);
const getTextBar = (): HTMLElement => findShapeByWidth(CONTROL_TEXT_BAR_WIDTH);

describe('UiSkeletonControlText geometry constants', () => {
  it('carries the measured Board D row box', () => {
    expect(CONTROL_SIZE).toBe('24px');
    expect(CONTROL_TEXT_GAP).toBe('8px');
    expect(CONTROL_TEXT_BAR_WIDTH).toBe('147px');
    expect(DEFAULT_CONTROL).toBe('checkbox');
  });

  it('adds up to the 179px design width', () => {
    const total: number =
      parseInt(CONTROL_SIZE, 10) +
      parseInt(CONTROL_TEXT_GAP, 10) +
      parseInt(CONTROL_TEXT_BAR_WIDTH, 10);
    expect(total).toBe(179);
  });

  it('lays the row out as a centred flex line and pins both shapes', () => {
    expect(controlTextContentStyles).toEqual({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    });
    expect(controlShapeStyles).toEqual({ flexShrink: 0 });
  });
});

describe('getControlRadius', () => {
  it('rounds the checkbox at 8px and the radio into a circle', () => {
    expect(getControlRadius('checkbox')).toBe('8px');
    expect(getControlRadius('radio')).toBe('50%');
    expect(CHECKBOX_CONTROL_RADIUS).not.toBe(RADIO_CONTROL_RADIUS);
  });
});

describe('UiSkeletonControlText', () => {
  it('renders a 24x24 checkbox placeholder beside the 147x18 bar by default', () => {
    render(<UiSkeletonControlText />);
    expect(getControl()).toHaveStyle({
      width: CONTROL_SIZE,
      height: CONTROL_SIZE,
      borderRadius: CHECKBOX_CONTROL_RADIUS,
    });
    expect(getTextBar()).toHaveStyle({ width: CONTROL_TEXT_BAR_WIDTH, height: '18px' });
  });

  it('switches only the control radius for the radio variant', () => {
    render(<UiSkeletonControlText control="radio" />);
    expect(getControl()).toHaveStyle({
      width: CONTROL_SIZE,
      height: CONTROL_SIZE,
      borderRadius: RADIO_CONTROL_RADIUS,
    });
    expect(getTextBar()).toHaveStyle({ width: CONTROL_TEXT_BAR_WIDTH, height: '18px' });
  });

  it('renders the checkbox variant explicitly the same as the default', () => {
    render(<UiSkeletonControlText control="checkbox" />);
    expect(getControl()).toHaveStyle({ borderRadius: CHECKBOX_CONTROL_RADIUS });
  });

  it('spaces the shapes on the measured 8px gap', () => {
    render(<UiSkeletonControlText />);
    expect(getShapeTree()).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      gap: CONTROL_TEXT_GAP,
    });
  });

  it('keeps both shapes from shrinking below the design size', () => {
    render(<UiSkeletonControlText />);
    expect(getControl()).toHaveStyle({ flexShrink: 0 });
    expect(getTextBar()).toHaveStyle({ flexShrink: 0 });
  });

  it('inherits the shared shimmer on both shapes', () => {
    render(<UiSkeletonControlText />);
    expect(getControl()).toHaveStyle({ backgroundSize: '200% 100%' });
    expect(getTextBar()).toHaveStyle({ backgroundSize: '200% 100%' });
  });

  it('exposes a busy, role-less, unnamed container with hidden status text', () => {
    render(<UiSkeletonControlText />);
    const root: HTMLElement = getRoot();
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('aria-label');
    expect(screen.getByText(DEFAULT_LOADING_TEXT)).toBeInTheDocument();
    expect(getShapeTree()).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards a custom loading text', () => {
    render(<UiSkeletonControlText loadingText="Loading option" />);
    expect(screen.getByText('Loading option')).toBeInTheDocument();
    expect(screen.queryByText(DEFAULT_LOADING_TEXT)).not.toBeInTheDocument();
  });

  it('never exposes a checkbox or radio widget role', () => {
    render(<UiSkeletonControlText control="radio" />);
    WIDGET_ROLES.forEach(role => {
      expect(screen.queryAllByRole(role, { hidden: true })).toHaveLength(0);
    });
  });

  it('applies id and sx', () => {
    render(<UiSkeletonControlText id="control-a" sx={{ padding: '3px' }} />);
    const root: HTMLElement = getRoot();
    expect(root).toHaveAttribute('id', 'control-a');
    expect(root).toHaveStyle({ padding: '3px' });
  });
});
