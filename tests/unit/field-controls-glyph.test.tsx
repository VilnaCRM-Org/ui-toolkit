import { render } from '@testing-library/react';
import React from 'react';

import { Glyph } from '../../src/components/field-controls';

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
  return svgs()[0];
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
