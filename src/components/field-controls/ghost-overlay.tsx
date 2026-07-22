import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import React from 'react';

import { crmBreakpointValues } from '../ui-breakpoints';
import colorTheme from '../ui-color-theme';

const palette: (typeof colorTheme)['palette'] = colorTheme.palette;
const TABLET_MAX: string = `@media (max-width: ${crmBreakpointValues.md}px)`;
const MOBILE_MAX: string = `@media (max-width: ${crmBreakpointValues.sm}px)`;

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
  const wrapperRect: DOMRect = wrapper.getBoundingClientRect();
  const inputRect: DOMRect = input.getBoundingClientRect();
  Object.assign(overlay.style, {
    left: `${inputRect.left - wrapperRect.left}px`,
    top: `${inputRect.top - wrapperRect.top}px`,
    height: `${inputRect.height}px`,
  });
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

// The typed mirror and the completion share the input's type: Inter Medium 14/18,
// 16 on tablet — so the transparent mirror occupies exactly the real typed width and
// the completion reads at the same size as the value. The `ui-ghost-run` class lets a
// forced-responsive showcase tile re-apply the tablet size directly.
const runFont: SystemStyleObject<Theme> = {
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  whiteSpace: 'pre',
  [TABLET_MAX]: { fontSize: '1rem' },
  [MOBILE_MAX]: { fontSize: '0.875rem' },
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
