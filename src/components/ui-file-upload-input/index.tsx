import { Box, FormControl, FormHelperText, FormLabel } from '@mui/material';
import React from 'react';

import { srOnlySx } from '../field-controls';

import FileUploadDropzone from './file-upload-dropzone';
import styles, { groupLabelActiveColor, mergeRootSx } from './styles';
import type { UiFileUploadInputProps, UiUploadStatus } from './types';
import UploadProgress from './upload-progress';
import UploadStatusPill from './upload-status-pill';
import { useDragAndDrop, type DragAndDrop } from './use-drag-and-drop';
import { useFileSelection, type FileSelection } from './use-file-selection';
import { useFileUploadField, type FileUploadField } from './use-file-upload-field';
import { useFileUploadWarnings } from './use-warnings';

const PROGRESS_LABEL: string = 'Upload progress';

interface FileUploadView {
  field: FileUploadField;
  drag: DragAndDrop;
  onFiles: (files: readonly File[]) => void;
  status: UiUploadStatus;
  progress: number | undefined;
}

function renderLabel(id: string, label: string | undefined, active: boolean): React.ReactElement {
  // Figma steps the label to grey250 while the field is active (a file dragging
  // over it); at rest/hover it is grey200 (styles.groupLabel).
  const sx = active ? [styles.groupLabel, { color: groupLabelActiveColor }] : styles.groupLabel;
  return (
    <FormLabel id={id} sx={sx}>
      {label}
    </FormLabel>
  );
}

function renderUploadState(
  status: UiUploadStatus,
  progress: number | undefined
): React.ReactElement {
  return (
    <>
      {status === 'uploading' ? <UploadProgress value={progress} label={PROGRESS_LABEL} /> : null}
      <UploadStatusPill status={status} />
    </>
  );
}

// The described-by message and the live region that speaks it, kept together so
// the two ways of surfacing the same state cannot drift apart.
function renderMessages(field: FileUploadField): React.ReactElement {
  return (
    <>
      {field.model.message == null ? null : (
        <FormHelperText id={field.ids.message}>{field.model.message}</FormHelperText>
      )}
      <Box key={field.announcementKey} role="status" aria-atomic="true" sx={srOnlySx}>
        {field.announcement}
      </Box>
    </>
  );
}

// Split out of UiFileUploadInput so no single function exceeds the Halstead-volume
// complexity budget.
function renderFileUploadField(
  props: UiFileUploadInputProps,
  view: FileUploadView
): React.ReactElement {
  return (
    <FormControl
      error={view.field.model.invalid}
      disabled={props.disabled}
      required={props.required}
      sx={mergeRootSx(props.sx)}
    >
      {view.field.named ? renderLabel(view.field.ids.label, props.label, view.drag.active) : null}
      <FileUploadDropzone
        field={view.field}
        upload={props}
        drag={view.drag}
        onFiles={view.onFiles}
      />
      {renderUploadState(view.status, view.progress)}
      {renderMessages(view.field)}
    </FormControl>
  );
}

/**
 * File-selection field: a native `<input type="file">` presented as the Figma
 * bordered field with a pill trigger, extended into a drop target. Type/size
 * rules are enforced on both entry paths; the async upload lifecycle
 * (`status`/`progress`) is reported visually through a progress bar and a status
 * pill, and to assistive technology through a polite `role="status"` region.
 *
 * The upload request itself stays with the consuming app — this control reports
 * an upload, it does not perform one.
 */
function UiFileUploadInput(props: Readonly<UiFileUploadInputProps>): React.ReactElement {
  useFileUploadWarnings(props);
  const selection: FileSelection = useFileSelection(props);
  const field: FileUploadField = useFileUploadField(props, selection);
  const drag: DragAndDrop = useDragAndDrop(field.model.disabled, selection.acceptFiles);

  return renderFileUploadField(props, {
    field,
    drag,
    onFiles: selection.acceptFiles,
    status: props.status ?? 'idle',
    progress: props.progress,
  });
}

UiFileUploadInput.displayName = 'UiFileUploadInput';

export default UiFileUploadInput;
