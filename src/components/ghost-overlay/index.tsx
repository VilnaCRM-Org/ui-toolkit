import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import React from 'react';

import colorTheme from '../ui-color-theme';

const palette: (typeof colorTheme)['palette'] = colorTheme.palette;

// The longhand CSS declarations written onto the overlay element. Kept as a plain
// string map so the box geometry and the copied type can be built independently and
// merged into one `Object.assign` write.
type GhostOverlayStyle = Record<string, string>;

// Mirrors the input's own type onto the overlay (the runs inherit it) so the ghost
// matches whatever field hosts it — search uses Inter 14, select Golos Text 15,
// multi-select Inter 16. Copying the computed font keeps the completion the same
// family/size/metrics as the typed value (and the transparent mirror the same width,
// so the completion starts exactly after it — not on top of it, and not vertically
// offset by a different font's metrics).
function ghostFontStyle(cs: CSSStyleDeclaration): GhostOverlayStyle {
  return {
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    fontWeight: cs.fontWeight,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing,
  };
}

// Measures the input's box against the positioned wrapper the overlay shares with it.
// The mirror must begin where the input's TEXT begins, not at its border box: the
// multi-select gives its input a left padding (chips and typed text need different
// insets), which would otherwise push the completion left, under the last typed
// letters. Search/select keep the input padding at 0, so this folds in as a no-op.
function ghostOverlayStyle(wrapper: HTMLElement, input: HTMLElement): GhostOverlayStyle {
  const wrapperRect: DOMRect = wrapper.getBoundingClientRect();
  const inputRect: DOMRect = input.getBoundingClientRect();
  const cs: CSSStyleDeclaration = getComputedStyle(input);
  const padLeft: number = parseFloat(cs.paddingLeft) || 0;
  return {
    left: `${inputRect.left - wrapperRect.left + padLeft}px`,
    top: `${inputRect.top - wrapperRect.top}px`,
    height: `${inputRect.height}px`,
    ...ghostFontStyle(cs),
  };
}

// Pins the ghost overlay over the native input: the transparent typed mirror then
// sits exactly on top of the real (dark) typed text, so the grey completion begins
// right where the input's own caret is. The overlay is a sibling of the field inside
// a positioned wrapper, so it measures the input's box relative to that wrapper
// (rather than hijacking MUI's own input ref).
export function alignGhostOverlay(overlay: HTMLElement): void {
  const wrapper: HTMLElement | null = overlay.parentElement;
  if (wrapper === null) return;
  const input: Element | null = wrapper.querySelector('input');
  if (!(input instanceof HTMLElement)) return;
  Object.assign(overlay.style, ghostOverlayStyle(wrapper, input));
}

// Re-syncs on viewport resize (a leading adornment — and thus the input's offset —
// can grow on the tablet breakpoint) and whenever the completion changes (the
// overlay may have just mounted).
export function useGhostAlignment(
  ref: React.RefObject<HTMLElement | null>,
  completion: string
): void {
  React.useLayoutEffect(() => {
    const overlay: HTMLElement | null = ref.current;
    if (overlay === null) return undefined;
    const sync = (): void => alignGhostOverlay(overlay);
    sync();
    window.addEventListener('resize', sync);
    return (): void => window.removeEventListener('resize', sync);
  }, [ref, completion]);
}

// The runs inherit their type (family/size/weight/line-height/letter-spacing) from the
// overlay, which `alignGhostOverlay` copies off the field's own input — so the mirror is
// exactly as wide as the typed text and the completion reads at the value's size, in
// whatever field hosts it. Only the non-inherited bit lives here. The `ui-ghost-run`
// class stays as a hook for a forced-responsive showcase tile.
const runFont: SystemStyleObject<Theme> = {
  whiteSpace: 'pre',
};

// The completion overlays the input, its left edge pinned to the input's text start
// by `useGhostAlignment`. `pointerEvents: none` keeps clicks on the field. The 2px gap
// leaves room for the input's own native caret, which sits at the typed-text end.
const overlaySx: SxProps<Theme> = {
  position: 'absolute',
  top: 0,
  left: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  pointerEvents: 'none',
};

// `forcedColorAdjust: none` keeps the mirror transparent in Windows High Contrast
// (where `color: transparent` is otherwise forced opaque and would double the real
// typed text); the completion falls back to the system muted ink so it still reads
// as a suggestion rather than committed input (a11y review M2).
const typedRunSx: SystemStyleObject<Theme> = {
  ...runFont,
  color: 'transparent',
  forcedColorAdjust: 'none',
};
const ghostRunSx: SystemStyleObject<Theme> = {
  ...runFont,
  color: palette.grey300.main,
  '@media (forced-colors: active)': { color: 'GrayText' },
};

export interface GhostOverlayProps {
  /** The user's typed text — mirrored transparently to position the completion. */
  typed: string;
  /** The grey completion shown after the typed text. Empty renders nothing. */
  completion: string;
}

// The inline typeahead affordance for the freeSolo search field and the select
// combobox. MUI's native `autoComplete`/`autoHighlight` do not work under `freeSolo`
// (they never complete and concatenate the completion into the value), so the
// completion is a purely visual overlay: the input value stays exactly the typed text,
// and this aria-hidden layer draws the grey completion right after it. The input keeps
// its own native (brand-blue) caret — identical to every other field — so there is no
// custom caret to render inconsistently across browsers/devices.
export function GhostOverlay({
  typed,
  completion,
}: Readonly<GhostOverlayProps>): React.ReactElement | null {
  const ref: React.RefObject<HTMLDivElement | null> = React.useRef<HTMLDivElement>(null);
  useGhostAlignment(ref, completion);
  if (completion.length === 0) return null;
  return (
    <Box ref={ref} aria-hidden="true" className="ui-ghost-overlay" sx={overlaySx}>
      <Box component="span" className="ui-ghost-run" sx={typedRunSx}>
        {typed}
      </Box>
      <Box component="span" className="ui-ghost-run" sx={ghostRunSx}>
        {completion}
      </Box>
    </Box>
  );
}
