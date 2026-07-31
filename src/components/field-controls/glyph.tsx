import React from 'react';

export interface GlyphProps {
  /**
   * The `d` path the glyph is drawn from. Most icons are a single path; the ones
   * Figma exports as several subpaths (the dots menus, the eye) pass an ordered
   * array instead and get one `<path>` per entry, all sharing the stroke recipe
   * below. A plain string behaves exactly as it always has.
   */
  path: string | readonly string[];
  /** The icon's native viewBox, so the stroke weight matches the Figma source. */
  viewBox: string;
  strokeWidth: string;
  /**
   * Rendered pixel size. Defaults to the shared 20px box. Non-square glyphs (e.g.
   * the folder) must pass their native dimensions here, otherwise the 20px default
   * scales them up and thickens the stroke past the Figma weight.
   */
  width?: string;
  height?: string;
}

/**
 * Shared 20px stroked glyph for the field controls. The repo has no icon
 * dependency, so each Figma icon is inlined as a path; this carries the wrapper
 * they all share — the 20px box, `currentColor` stroke (so the surrounding
 * control tints it), round caps/joins, and removal from the accessibility tree.
 *
 * The glyphs are decorative: `aria-hidden` + `focusable="false"` keep them out of
 * the tab order and the AT tree, because the control they sit inside already
 * carries the accessible name.
 */
export function Glyph({
  path,
  viewBox,
  strokeWidth,
  width = '20',
  height = '20',
}: GlyphProps): React.ReactElement {
  const paths: readonly string[] = typeof path === 'string' ? [path] : path;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {paths.map(d => (
        <path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
