import type { UiUploadStatus } from './types';

// Builds the polite live-region text for the file field. Neither picking a file
// nor an upload finishing moves focus or changes the DOM a screen reader is
// sitting on, so without this the whole flow is silent (WCAG 4.1.3).
//
// Percentage ticks are deliberately absent: the progress bar carries
// `aria-valuenow`, which a screen-reader user can query on demand, whereas
// announcing every tick would talk over everything else on the page. Only the
// state transitions are spoken.

const STATUS_TEXT: Readonly<Record<UiUploadStatus, string>> = {
  idle: '',
  uploading: 'Upload in progress.',
  success: 'Upload complete.',
  error: 'Upload failed.',
};

function selectionText(fileNames: readonly string[]): string {
  if (fileNames.length === 0) {
    return 'No file selected.';
  }
  if (fileNames.length === 1) {
    return `${fileNames[0]} selected.`;
  }
  return `${fileNames.length} files selected.`;
}

/**
 * A rejected selection announces its reason instead of the selection summary:
 * the files were not accepted, so reporting them as "selected" would contradict
 * what the field now shows.
 */
export function buildUploadAnnouncement(
  status: UiUploadStatus,
  fileNames: readonly string[],
  validationError: string | null
): string {
  if (validationError != null) {
    return validationError;
  }
  return `${selectionText(fileNames)} ${STATUS_TEXT[status]}`.trim();
}
