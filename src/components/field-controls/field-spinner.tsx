import { CircularProgress } from '@mui/material';
import React from 'react';

import { FIELD_SPINNER_MD, FIELD_SPINNER_THICKNESS, fieldSpinnerSx } from './field-spinner-styles';

export interface FieldSpinnerProps {
  /** Rendered box, as a CSS length. Defaults to the 20px shared Glyph box. */
  size?: string;
}

// The kit's one loading indicator, reused rather than reinvented: the same MUI
// `CircularProgress` at the same thickness the submit spinner already draws
// (`ui-form/submit-spinner.tsx`), so every busy surface paints the same arc.
//
// Decorative on purpose. `CircularProgress` emits `role="progressbar"`
// unconditionally but only carries `aria-valuenow` in its determinate branch, so
// a bare indeterminate one is a nameless, valueless progressbar. `aria-hidden`
// keeps it out of the accessibility tree entirely and the words go to the owning
// control's polite `role="status"` region instead — the split `ui-skeletons`
// ratified (DEV-14): indeterminate ⇒ decorative + live region; determinate ⇒ a
// real named progressbar (`ui-file-upload-input/upload-progress.tsx`).
//
// The prop surface is deliberately just `size`. No spread, and `aria-hidden` is
// written last, so nothing downstream can re-expose the progressbar.
export function FieldSpinner({
  size = FIELD_SPINNER_MD,
}: Readonly<FieldSpinnerProps>): React.ReactElement {
  return (
    <CircularProgress
      size={size}
      thickness={FIELD_SPINNER_THICKNESS}
      // Load-bearing, not cosmetic. MUI's shrink keyframe starts at
      // `stroke-dasharray: 1px, 200px` — a dot. Freeze the animation (reduced
      // motion, or the visual harness's blanket `animation: none`) without this
      // and the arc freezes at that dot, i.e. the busy signal disappears exactly
      // where it must stay visible. `disableShrink` pins the dash at 80px, so a
      // frozen spinner is still a legible ~40% arc and only the rotation stops.
      disableShrink
      sx={fieldSpinnerSx}
      aria-hidden
    />
  );
}
