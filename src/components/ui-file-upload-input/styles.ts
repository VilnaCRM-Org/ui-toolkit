import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import colorTheme from '@/components/ui-color-theme';

// Figma source: the file-upload control, nodes 449:25710 (rest), 449:25717
// (hover), 449:25703 (active), 449:25724 (disabled) and 449:25676 (error) — the
// titled five-state cluster (heading 449:25635) painted on Board A (frame
// 439:19252) of the "Ui kit" page. Figma ships no reusable upload component
// master, so these state frames are the styling contract (DEV-12).
//
// This module carries the parts that do not change with interaction state; the
// field surface, the file name and the status tint live in ./state-styles and
// are re-exported below, so every consumer still styles itself from `./styles`.
//
// - Label: Inter Medium 14/18 #404142 (rest/hover) -> #57595B (active/error),
//   9px above the field, #D0D4D8 when disabled.
// - Trigger: pill (57px radius) inset 9px from the right, 12px/24px padding,
//   an 8px gap, a 20px folder glyph and Golos Text Medium 15/18 white.
//   Rest #1EAEFF, hover #00A3FF, active #0399ED — the shared button tokens.
//
// The design specifies only the empty/trigger state: no filename display, no
// progress bar, no status pill and no uploading state exist in it. Those are
// required by the story, so they reuse the design's own parts — the import
// progress bar (269:7159/7160) and the "Tags" status pill (345:17479) — rather
// than inventing new visuals. Every colour is an existing ui-color-theme token
// and every tint is derived from one via `alpha`. Contrast hardening stays
// deferred to the accessibility-visuals PR, per Story 1.3.

export { dropzoneSx, fileTextSx, statusPillSx } from './state-styles';

const palette: Theme['palette'] = colorTheme.palette;

/** Figma steps the label to grey250 while the field is active (a file dragging over). */
export const groupLabelActiveColor: string = palette.grey250.main;

// The field fills its container instead of shrink-wrapping its contents, so its
// width does not jump as file names change — and so the name can actually
// ellipsize rather than stretching the box. Consumers constrain it via `sx`.
// Only merged into the consumer sx by `mergeRootSx`, so kept module-local. It also
// styles the descendant FormHelperText: this control has no ThemeProvider of its
// own, so without this the message falls back to MUI's Roboto 12px — Figma wants
// the shared Inter Medium 14/18 treatment, grey250, #DC3939 on error.
const rootSx: SystemStyleObject<Theme> = {
  width: '100%',
  '& .MuiFormHelperText-root': {
    margin: '0.25rem 0 0 0',
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.125rem',
    // Figma "14 medium" tracks at 0; without this the helper text inherits MUI's
    // default caption letterSpacing (0.03333em), reading looser than the design.
    letterSpacing: 0,
    color: palette.grey250.main,
    '&.Mui-error': { color: palette.error.main },
  },
};

export function mergeRootSx(consumer: SxProps<Theme> | undefined): SxProps<Theme> {
  const extra: SxProps<Theme> = consumer ?? {};
  return [rootSx, ...(Array.isArray(extra) ? extra : [extra])];
}

export default {
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '3.5625rem',
    backgroundColor: palette.primary.main,
    color: palette.white.main,
    fontFamily: 'Golos Text',
    fontWeight: 500,
    fontSize: '0.9375rem',
    lineHeight: '1.125rem',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    '&:hover': { backgroundColor: palette.containedButtonHover.main },
    '&:active': { backgroundColor: palette.containedButtonActive.main },
    // Clipped rather than `display: none`, so the input stays focusable and in
    // the accessibility tree — it is the real, keyboard-operable control.
    '& .ui-file-upload-native': {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)',
      whiteSpace: 'nowrap',
      border: 0,
    },
  },

  statusDot: {
    width: '0.3125rem',
    height: '0.3125rem',
    borderRadius: '50%',
    flexShrink: 0,
  },

  progress: {
    height: '0.5rem',
    marginTop: '0.5rem',
    borderRadius: '4.5rem',
    backgroundColor: palette.grey500.main,
    '& .MuiLinearProgress-bar': {
      backgroundColor: palette.primary.main,
      borderRadius: '4.5rem',
    },
  },

  groupLabel: {
    marginBottom: '0.5625rem',
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.125rem',
    // Figma "file upload" label is grey200 (#404142) at rest/hover (nodes 449:25710
    // / 25717); grey250 (#57595B) while active/error, grey400 when disabled.
    color: palette.grey200.main,
    '&.Mui-disabled': { color: palette.grey400.main },
    // Figma keeps the label grey250 in the error state (the red stroke + message
    // carry the error), so suppress MUI's default red `.Mui-error` label.
    '&.Mui-error': { color: palette.grey250.main },
  },
};
