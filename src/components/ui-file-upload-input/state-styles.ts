import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

import colorTheme from '@/components/ui-color-theme';

import type { UiUploadStatus } from './types';

// The state-dependent halves of the control, kept apart from the static surfaces
// in ./styles so neither module outgrows its maintainability budget. Figma
// source: nodes 449:25710 (rest), 449:25717 (hover), 449:25703 (active),
// 449:25724 (disabled) and 449:25676 (error).
//
// - Field: 422x64, white, 8px radius, 1px stroke #D0D4D8 (grey400) at rest; Figma
//   darkens the stroke to #969B9D on hover/active. Not a dashed dropzone; the
//   design has no drag affordance at all (drag-and-drop is a behavioural addition
//   required by the story, styled with the design's own tint recipe).
// - Error swaps the stroke to #DF7878 (strokeDanger, NOT the #DC3939 error red).
// - Disabled greys the field to #E1E7EA with no border, its pill to #D0D4D8 and
//   the pill text to #969B9D.
//
// The status pill has no state in the design either: it reuses the "Tags" pill
// (345:17479), tinted per status from an existing ui-color-theme token.

const palette: Theme['palette'] = colorTheme.palette;

/** The design's tint strength for a state-coloured surface. */
const TINT: number = 0.1;

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
  border: `1px solid ${palette.grey400.main}`,
  borderRadius: '0.5rem',
};

// Figma darkens the field stroke to #969B9D (grey300) on hover and on press
// (the "Active" state, node 449:25703). Applied only in the plain rest state (see
// dropzoneSx), so it never overrides the drag tint, the error stroke or the
// border-less disabled surface.
const dropzoneInteract: SystemStyleObject<Theme> = {
  '&:hover, &:active': { borderColor: palette.grey300.main },
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
    !active && !invalid && !disabled && dropzoneInteract,
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
