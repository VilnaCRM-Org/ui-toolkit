import { render } from '@testing-library/react';
import React from 'react';

import { CopyGlyph, COPY_ICON_PATH } from '../../src/components/ui-copy-field/copy-glyph';

import { nodesMatching } from './utils/dom-queries';
import firstOf from './utils/first-of';

const FIGMA_COPY_02_PATH: string = [
  'M13.3333 6.66667V4.33333C13.3333 3.39991 13.3333 2.9332 13.1517',
  '2.57668C12.9919 2.26308 12.7369 2.00811 12.4233 1.84832C12.0668 1.66667',
  '11.6001 1.66667 10.6667 1.66667H4.33333C3.39991 1.66667 2.9332 1.66667 2.57668',
  '1.84832C2.26308 2.00811 2.00811 2.26308 1.84832 2.57668C1.66667 2.9332 1.66667',
  '3.39991 1.66667 4.33333V10.6667C1.66667 11.6001 1.66667 12.0668 1.84832',
  '12.4233C2.00811 12.7369 2.26308 12.9919 2.57668 13.1517C2.9332 13.3333 3.39991',
  '13.3333 4.33333 13.3333H6.66667M9.33333 18.3333H15.6667C16.6001 18.3333',
  '17.0668 18.3333 17.4233 18.1517C17.7369 17.9919 17.9919 17.7369 18.1517',
  '17.4233C18.3333 17.0668 18.3333 16.6001 18.3333 15.6667V9.33333C18.3333',
  '8.39991 18.3333 7.9332 18.1517 7.57668C17.9919 7.26308 17.7369 7.00811 17.4233',
  '6.84832C17.0668 6.66667 16.6001 6.66667 15.6667 6.66667H9.33333C8.39991',
  '6.66667 7.9332 6.66667 7.57668 6.84832C7.26308 7.00811 7.00811 7.26308 6.84832',
  '7.57668C6.66667 7.9332 6.66667 8.39991 6.66667 9.33333V15.6667C6.66667 16.6001',
  '6.66667 17.0668 6.84832 17.4233C7.00811 17.7369 7.26308 17.9919 7.57668',
  '18.1517C7.9332 18.3333 8.39991 18.3333 9.33333 18.3333Z',
].join(' ');

const PATH_TOKEN_COUNT: number = 108;

describe('CopyGlyph — copy-02 path markup', () => {
  it('pins the whole joined path to the Figma export, coordinate for coordinate', () => {
    expect(COPY_ICON_PATH).toBe(FIGMA_COPY_02_PATH);
    expect(COPY_ICON_PATH).toHaveLength(1097);
  });

  it('keeps every coordinate separated by exactly one space', () => {
    expect(COPY_ICON_PATH).not.toMatch(/\s{2}/);
    expect(COPY_ICON_PATH.split(' ')).toHaveLength(PATH_TOKEN_COUNT);
    expect(COPY_ICON_PATH).not.toMatch(/\d{2}\.\d{4,5}\d\.\d/);
  });

  it('renders the pinned path on the single svg path element', () => {
    render(<CopyGlyph />);

    const path: Element = firstOf(nodesMatching('svg path'));
    expect(path).toHaveAttribute('d', FIGMA_COPY_02_PATH);
  });
});
