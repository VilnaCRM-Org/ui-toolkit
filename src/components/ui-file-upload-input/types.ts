import type { SxProps, Theme } from '@mui/material';
import type React from 'react';

/**
 * Async lifecycle the control reflects. The upload request itself belongs to the
 * consuming app — this is a presentational primitive, not a transport — so the
 * app drives `status`/`progress` while the control owns selection, validation
 * and the assistive-technology reporting around them.
 */
export type UiUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/** Type/size rules enforced before selected files reach `onFilesChange`. */
export interface UiFileUploadConstraints {
  /**
   * Native `accept` list, e.g. `'.png,.jpg'` or `'image/*'`. Also re-checked in
   * JavaScript because the attribute only filters the OS picker: files arriving
   * by drag-and-drop bypass it entirely.
   */
  accept?: string | undefined;
  /** Largest accepted size **per file**, in bytes. */
  maxSizeBytes?: number | undefined;
  /**
   * Allows picking more than one file at a time. Also validated, not just passed
   * to the input: the attribute constrains the OS picker, but a drop can deliver
   * any number of files regardless.
   */
  multiple?: boolean | undefined;
}

/**
 * Shared contract support:
 * - supported: value (`files`), onChange (`onFilesChange`), disabled, error, sx
 * - exceptions: size, variant — the Figma file input is a single fixed 46px
 *   field with one pill trigger and no size/variant axis, matching `UiCheckbox`
 *   and `UiRadioGroup`.
 *
 * File-selection field built on a native `<input type="file">` so the OS picker,
 * keyboard operation and assistive-technology semantics are the platform's
 * rather than re-implemented. The control owns its accessible name (`label` →
 * `FormLabel`, else `aria-label`), the `aria-describedby` link to its message,
 * `aria-invalid`, a polite `role="status"` region for selection/upload
 * outcomes, and a `role="progressbar"` for long-running uploads.
 *
 * Selection is **always controlled**: `files` (defaulting to none) is the source
 * of truth and the next selection must be fed back through `onFilesChange`, so a
 * field that starts empty never silently flips to uncontrolled.
 */
export interface UiFileUploadInputProps extends UiFileUploadConstraints {
  /** Currently selected files. Omit (or pass `[]`) for "nothing selected". */
  files?: readonly File[] | undefined;
  /**
   * Called with the files that passed validation. Never called for a rejected
   * selection — `onValidationError` fires instead, so an invalid drop cannot
   * quietly replace a good selection.
   */
  onFilesChange?: ((files: File[]) => void) | undefined;
  /** Called with the human-readable reason a selection was rejected. */
  onValidationError?: ((message: string) => void) | undefined;
  /** Async upload lifecycle; drives the status pill and the live region. */
  status?: UiUploadStatus | undefined;
  /**
   * Completion percentage (0–100) for `status="uploading"`, clamped on render.
   * Omitted values render an empty determinate bar rather than an indeterminate
   * one, so the bar never implies progress the app has not reported.
   */
  progress?: number | undefined;
  /** Forces the invalid styling; `status="error"` implies it too. */
  error?: boolean | undefined;
  /**
   * Constraint hint in the resting state ("PNG or JPG, up to 2 MB") and the
   * failure reason when the upload errors. Linked via `aria-describedby`. A
   * validation error replaces it while the rejected selection stands.
   */
  helperText?: React.ReactNode | undefined;
  /** Visible field label — the preferred accessible name (WCAG 2.4.6 / 3.3.2). */
  label?: string | undefined;
  /** Accessible name used only when there is no visible `label`. */
  'aria-label'?: string | undefined;
  /** Text shown in the field while nothing is selected. */
  placeholder?: string | undefined;
  /** Text on the pill that opens the picker. */
  buttonLabel?: string | undefined;
  disabled?: boolean | undefined;
  /**
   * Marks the field required for assistive technology via `aria-required`.
   * Native constraint validation is deliberately *not* used: the control is
   * React-controlled and clears the input's value after every pick (so the same
   * file can be re-picked after a failed upload), which would leave a natively
   * `required` input permanently `:invalid`. Enforcing submission is the
   * consuming form's job, as with the other field controls.
   */
  required?: boolean | undefined;
  /** Seeds the input/label/message ids (and can associate an external label). */
  id?: string | undefined;
  sx?: SxProps<Theme> | undefined;
}
