import React from 'react';

import { Glyph } from '../field-controls';

import {
  DOTS_HORIZONTAL_PATHS,
  DOTS_VERTICAL_PATHS,
  EYE_OFF_PATH,
  EYE_PATHS,
  SETTINGS_PATH,
  TRASH_PATH,
  X_CLOSE_PATH,
} from './icon-paths';
import type { ActionIconName } from './types';

interface GlyphSpec {
  path: string | readonly string[];
  viewBox: string;
  strokeWidth: string;
}

const UNIT_24: string = '0 0 24 24';
const STROKE_2: string = '2';

// Five of the six icons are authored in the shared 24-unit space at stroke 2.
// `settings-04` keeps its native 30-unit viewBox and 2.5 stroke: rendered into
// the same 24px box that scales to exactly 2, so it matches its siblings without
// a single coordinate being rewritten.
const GLYPH_SPECS: Readonly<Record<ActionIconName, GlyphSpec>> = {
  'x-close': { path: X_CLOSE_PATH, viewBox: UNIT_24, strokeWidth: STROKE_2 },
  'dots-horizontal': { path: DOTS_HORIZONTAL_PATHS, viewBox: UNIT_24, strokeWidth: STROKE_2 },
  'dots-vertical': { path: DOTS_VERTICAL_PATHS, viewBox: UNIT_24, strokeWidth: STROKE_2 },
  eye: { path: EYE_PATHS, viewBox: UNIT_24, strokeWidth: STROKE_2 },
  settings: { path: SETTINGS_PATH, viewBox: '0 0 30 30', strokeWidth: '2.5' },
  trash: { path: TRASH_PATH, viewBox: UNIT_24, strokeWidth: STROKE_2 },
};

const EYE_OFF_SPEC: GlyphSpec = { path: EYE_OFF_PATH, viewBox: UNIT_24, strokeWidth: STROKE_2 };

export interface ActionGlyphProps {
  icon: ActionIconName;
  pressed: boolean;
}

/**
 * The glyph inside one action slot. It is DECORATIVE in every branch — the
 * shared `Glyph` wrapper bakes in `aria-hidden="true"` and `focusable="false"`
 * and strokes with `currentColor`, so the button that holds it owns both the
 * accessible name and the per-lane ink.
 *
 * The eye→eye-off swap is the one structural change any state makes, and it is
 * purely visual: the toggle's state reaches assistive tech through
 * `aria-pressed` alone, so both glyphs are hidden either way. A DISABLED toggle
 * therefore keeps rendering whichever glyph it is currently in — the eye-off in
 * Figma's disabled column is a board copy-paste artefact, not a rule.
 */
export function ActionGlyph({ icon, pressed }: Readonly<ActionGlyphProps>): React.ReactElement {
  const spec: GlyphSpec = icon === 'eye' && pressed ? EYE_OFF_SPEC : GLYPH_SPECS[icon];
  return (
    <Glyph
      path={spec.path}
      viewBox={spec.viewBox}
      strokeWidth={spec.strokeWidth}
      width="24"
      height="24"
    />
  );
}
