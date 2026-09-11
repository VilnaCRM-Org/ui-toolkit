import { matchesAccept } from './accept-matcher';
import { formatBytes } from './format-bytes';
import type { UiFileUploadConstraints } from './types';

export interface FileValidationResult {
  /** The files to hand to the consumer — empty when the selection was rejected. */
  accepted: File[];
  /** Why the selection was rejected, or `null` when it passed. */
  error: string | null;
}

// Messages name the offending file and restate the rule, so the user can act on
// them without hunting for the constraint elsewhere on the page (WCAG 3.3.3).

function acceptError(file: File, accept: string | undefined): string | null {
  if (accept == null || matchesAccept(file, accept)) {
    return null;
  }
  return `"${file.name}" is not an accepted file type. Accepted types: ${accept}.`;
}

function sizeError(file: File, maxSizeBytes: number | undefined): string | null {
  if (maxSizeBytes == null || file.size <= maxSizeBytes) {
    return null;
  }
  return `"${file.name}" is larger than the ${formatBytes(maxSizeBytes)} limit.`;
}

// `multiple` constrains the picker dialog only, so without this a single-file
// field silently accepts a three-file drop and hands the consumer an array it
// never expected.
function batchError(files: readonly File[], constraints: UiFileUploadConstraints): string | null {
  if (constraints.multiple === true || files.length <= 1) {
    return null;
  }
  return 'Only one file can be selected at a time.';
}

function fileError(file: File, constraints: UiFileUploadConstraints): string | null {
  return acceptError(file, constraints.accept) ?? sizeError(file, constraints.maxSizeBytes);
}

/**
 * Validates a whole selection against the type/size constraints.
 *
 * A selection is all-or-nothing: one offending file rejects the batch rather
 * than silently uploading the rest, so what the user picked and what the app
 * receives can never diverge without them being told. The first offender is the
 * one reported.
 */
export function validateFiles(
  files: readonly File[],
  constraints: UiFileUploadConstraints
): FileValidationResult {
  const batch: string | null = batchError(files, constraints);
  if (batch != null) {
    return { accepted: [], error: batch };
  }
  const offender: File | undefined = files.find(file => fileError(file, constraints) != null);
  if (offender == null) {
    return { accepted: [...files], error: null };
  }
  return { accepted: [], error: fileError(offender, constraints) };
}
