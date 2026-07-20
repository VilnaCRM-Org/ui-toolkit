import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

import colorTheme from '@/components/ui-color-theme';

import type { UiUploadStatus } from './types';

// Figma source: the file-upload control, nodes 449:25703 (active), 449:25717
// (hover), 449:25724 (disabled) and 449:25759 (error). The cluster is detached
// from every page in the file, so it is reachable only by direct node id — which
// is why a page-tree search reports "no upload component".
//
// - Field: 422x64, white, 1px SOLID #969B9D, 8px radius. Not a dashed dropzone;
//   the design has no drag affordance at all (drag-and-drop is a behavioural
//   addition required by the story, styled with the design's own tint recipe).
// - Label: Inter Medium 14/18 #57595B, 9px above the field.
// - Trigger: pill (57px radius) inset 9px from the right, 12px/24px padding,
//   an 8px gap, a 20px folder glyph and Golos Text Medium 15/18 white.
//   Rest #1EAEFF, hover #00A3FF, active #0399ED — the shared button tokens.
// - Error swaps the stroke to #DF7878 (strokeDanger, NOT the #DC3939 error red).
// - Disabled greys the whole control: #E1E7EA field with NO border, #D0D4D8
//   pill, #969B9D pill text, #D0D4D8 label.
//
// The design specifies only the empty/trigger state: no filename display, no
// progress bar, no status pill and no uploading state exist in it. Those are
// required by the story, so they reuse the design's own parts — the import
// progress bar (269:7159/7160) and the "Tags" status pill (345:17479) — rather
// than inventing new visuals. Every colour is an existing ui-color-theme token
// and every tint is derived from one via `alpha`. Contrast hardening stays
// deferred to the accessibility-visuals PR, per Story 1.3.

const palette: Theme['palette'] = colorTheme.palette;

/** The design's tint strength for a state-coloured surface. */
const TINT: number = 0.1;

// The field fills its container instead of shrink-wrapping its contents, so its
// width does not jump as file names change — and so the name can actually
// ellipsize rather than stretching the box. Consumers constrain it via `sx`.
// Only merged into the consumer sx by `mergeRootSx`, so kept module-local.
const rootSx: SystemStyleObject<Theme> = { width: '100%' };

export function mergeRootSx(consumer: SxProps<Theme> | undefined): SxProps<Theme> {
  const extra: SxProps<Theme> = consumer ?? {};
  return [rootSx, ...(Array.isArray(extra) ? extra : [extra])];
}

const dropzone: SystemStyleObject<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
  boxSizing: 'border-box',
  width: '100%',
  minHeight: '4rem',
  paddingLeft: '1.75rem',
  paddingRight: '0.5625rem',
  backgroundColor: palette.white.main,
  border: `1px solid ${palette.grey300.main}`,
  borderRadius: '0.5rem',
};

const dropzoneActive: SystemStyleObject<Theme> = {
  borderColor: palette.primary.main,
  backgroundColor: alpha(palette.primary.main, TINT),
};

const dropzoneInvalid: SystemStyleObject<Theme> = {
  borderColor: palette.strokeDanger.main,
};

const dropzoneDisabled: SystemStyleObject<Theme> = {
  backgroundColor: palette.brandGray.main,
  border: 'none',
  '& .ui-file-upload-name': { color: palette.grey300.main },
  '& .ui-file-upload-pill': {
    backgroundColor: palette.grey400.main,
    color: palette.grey300.main,
    cursor: 'default',
  },
};

/** Composes the field surface for the current interaction state. */
export function dropzoneSx(active: boolean, invalid: boolean, disabled: boolean): SxProps<Theme> {
  return [
    dropzone,
    active && dropzoneActive,
    invalid && dropzoneInvalid,
    disabled && dropzoneDisabled,
  ];
}

const fileText: SystemStyleObject<Theme> = {
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  color: palette.darkPrimary.main,
};

/** A chosen file reads as a value; the resting hint reads as a placeholder. */
export function fileTextSx(hasSelection: boolean): SxProps<Theme> {
  return [fileText, !hasSelection && { color: palette.grey300.main }];
}

const STATUS_TONE: Readonly<Record<UiUploadStatus, string>> = {
  idle: palette.grey300.main,
  uploading: palette.primary.main,
  success: palette.success.main,
  error: palette.error.main,
};

const statusPill: SystemStyleObject<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  alignSelf: 'flex-start',
  gap: '0.25rem',
  marginTop: '0.5rem',
  padding: '0.3125rem 0.5rem',
  borderRadius: '0.25rem',
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  color: palette.darkPrimary.main,
};

/** Tints the status pill and its dot with the colour for `status`. */
export function statusPillSx(status: UiUploadStatus): SxProps<Theme> {
  const tone: string = STATUS_TONE[status];
  return [
    statusPill,
    { backgroundColor: alpha(tone, TINT), '& .ui-file-upload-dot': { backgroundColor: tone } },
  ];
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
    // The native input is clipped, so its own focus ring would be invisible;
    // the pill it labels wears the ring instead, keeping keyboard focus
    // visible (WCAG 2.4.7).
    '&:focus-within': {
      outline: `2px solid ${palette.darkPrimary.main}`,
      outlineOffset: '2px',
    },
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
    color: palette.grey250.main,
    '&.Mui-disabled': { color: palette.grey400.main },
  },
};
