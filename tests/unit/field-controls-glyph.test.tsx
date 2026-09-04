import { render } from '@testing-library/react';
import React from 'react';

import { ChevronDownGlyph, Glyph } from '../../src/components/field-controls';

import firstOf from './utils/first-of';

// Two throwaway subpaths, deliberately not any real icon's: this suite is about
// the wrapper's contract, not about a particular Figma vector.
const FIRST: string = 'M4 4L20 20';
const SECOND: string = 'M20 4L4 20';

function paths(): Element[] {
  return Array.from(document.querySelectorAll('path'));
}

function dOf(): string[] {
  return paths().map((path: Element): string => path.getAttribute('d') ?? '');
}

function svgs(): Element[] {
  return Array.from(document.querySelectorAll('svg'));
}

function svg(): Element {
  return firstOf(svgs());
}

describe('Glyph — the shared stroked-icon wrapper', () => {
  it('renders one path for a plain string, in the default 20px box', () => {
    render(<Glyph path={FIRST} viewBox="0 0 24 24" strokeWidth="2" />);

    expect(dOf()).toEqual([FIRST]);
    expect(svg()).toHaveAttribute('width', '20');
    expect(svg()).toHaveAttribute('height', '20');
    expect(svg()).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('renders one path per entry, in order, for an array of subpaths', () => {
    // The dots menus and the eye are exported by Figma as several subpaths; they
    // must share ONE svg and ONE stroke recipe rather than stacking wrappers.
    render(
      <Glyph path={[FIRST, SECOND]} viewBox="0 0 24 24" strokeWidth="2" width="24" height="24" />
    );

    expect(dOf()).toEqual([FIRST, SECOND]);
    expect(svgs()).toHaveLength(1);
    expect(svg()).toHaveAttribute('width', '24');
    expect(svg()).toHaveAttribute('height', '24');
  });

  it('renders DUPLICATE subpaths without a React key collision', () => {
    // Entries are keyed by position, not by `d`. A `d`-derived key would collide
    // on two identical subpaths and drop one of them with a console error.
    const error: jest.SpyInstance = jest.spyOn(console, 'error').mockImplementation();
    try {
      render(<Glyph path={[FIRST, FIRST]} viewBox="0 0 24 24" strokeWidth="2" />);

      expect(dOf()).toEqual([FIRST, FIRST]);
      expect(error).not.toHaveBeenCalled();
    } finally {
      error.mockRestore();
    }
  });

  it('renders an empty svg for an empty subpath array, without throwing', () => {
    // A frozen icon definition should never be empty, but an array arriving empty
    // must degrade to an invisible glyph rather than take the control down.
    function renderEmpty(): unknown {
      return render(<Glyph path={[]} viewBox="0 0 24 24" strokeWidth="2" />);
    }

    expect(renderEmpty).not.toThrow();

    expect(paths()).toHaveLength(0);
    expect(svgs()).toHaveLength(1);
    expect(svg()).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps the decorative and stroke recipe identical across both path forms', () => {
    render(<Glyph path={[FIRST, SECOND]} viewBox="0 0 30 30" strokeWidth="2.5" />);

    expect(svg()).toHaveAttribute('aria-hidden', 'true');
    expect(svg()).toHaveAttribute('focusable', 'false');
    expect(svg()).toHaveAttribute('fill', 'none');
    paths().forEach((path: Element): void => {
      expect(path).toHaveAttribute('stroke', 'currentColor');
      expect(path).toHaveAttribute('stroke-width', '2.5');
      expect(path).toHaveAttribute('stroke-linecap', 'round');
      expect(path).toHaveAttribute('stroke-linejoin', 'round');
    });
  });
});

// The shared popup indicator for the search-style comboboxes. Its own suite,
// because the two consumers (`UiSelectWithSearch`, `UiMultiSelect`) assert the
// combobox contract and never the vector itself.
describe('ChevronDownGlyph — the shared popup indicator', () => {
  it('draws the thin 1.5px chevron in the 20px box, written out rather than imported', () => {
    render(<ChevronDownGlyph />);

    expect(dOf()).toEqual(['M5 8l5 5 5-5']);
    expect(svg()).toHaveAttribute('viewBox', '0 0 20 20');
    expect(firstOf(paths())).toHaveAttribute('stroke-width', '1.5');
    // Thin on purpose: `ui-item-row` and `ui-pagination` bake their own chevrons at
    // 1.667 precisely because this one could not match their export weight.
    expect(firstOf(paths())).toHaveAttribute('stroke', 'currentColor');
    expect(svg()).toHaveAttribute('aria-hidden', 'true');
    expect(svg()).toHaveAttribute('focusable', 'false');
  });
});
