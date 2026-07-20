import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

import colorTheme from '@/components/ui-color-theme';

import type { UiUploadStatus } from './types';

// Figma sources, all on the "Design CRM" page of the VilnaCRM UI kit:
//
// - Field + trigger — node 193:4763 "Input": a 46px-tall white field with a 1px
//   #D0D4D8 stroke and an 8px radius; the file text sits 15px from the left in
//   Inter Medium 14/18 #1A1C1E, and the picker trigger is a 57px-radius pill in
//   #1EAEFF with white Golos Text Medium 15/18, inset 7px from the right.
// - Progress — node 269:7159/269:7160 (import progress): an 8px track in
//   #EAECEE with a #1EAEFF fill, both fully rounded (72px).
// - Status pill — node 345:17479 "Tags": 4px radius, 5px/8px padding, a 5px dot
//   and a 10% tint of the state colour behind Inter Medium 14/18 #1A1C1E.
// - Disabled — the greyed variant of node 187:7912: #F4F5F6 fill on an #E1E7EA
//   stroke with #969B9D text.
//
// Every colour resolves to an existing ui-color-theme token and every tint is
// derived from one via `alpha`, so no new colours are introduced. States the
// Figma frames do not specify (hover, drag-over, focus) reuse the established
// UiButton hover token and the primary/10% tint recipe the design already uses
// for its own "selected/active" surfaces. Contrast hardening of these tokens is
// deferred to the accessibility-visuals PR (per Story 1.3), consistent with the
// other Epic 2 controls.

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
  minHeight: '2.875rem',
  paddingLeft: '0.9375rem',
  paddingRight: '0.4375rem',
  backgroundColor: palette.white.main,
  border: `1px solid ${palette.grey400.main}`,
  borderRadius: '0.5rem',
};

const dropzoneActive: SystemStyleObject<Theme> = {
  borderColor: palette.primary.main,
  backgroundColor: alpha(palette.primary.main, TINT),
};

const dropzoneInvalid: SystemStyleObject<Theme> = {
  borderColor: palette.error.main,
};

const dropzoneDisabled: SystemStyleObject<Theme> = {
  backgroundColor: palette.backgroundGrey200.main,
  borderColor: palette.brandGray.main,
  '& .ui-file-upload-name': { color: palette.grey300.main },
  '& .ui-file-upload-pill': {
    backgroundColor: palette.grey400.main,
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
  fileName: {
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
  },

  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: '0.5rem 1.5rem',
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

  // Figma node 193:4764: the field label is Inter Medium 12/18 in #404142, set
  // 4px above the field — a step smaller than the 14px field text, unlike the
  // other Epic 2 controls whose own frames put label and value on one scale.
  groupLabel: {
    marginBottom: '0.25rem',
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '0.75rem',
    lineHeight: '1.125rem',
    color: palette.grey200.main,
  },
};
