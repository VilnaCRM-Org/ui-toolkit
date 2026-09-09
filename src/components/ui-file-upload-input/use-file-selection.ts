import React from 'react';

import type { UiFileUploadInputProps } from './types';
import { validateFiles, type FileValidationResult } from './validate-files';

export interface FileSelection {
  /** Why the last selection was rejected, or `null` when it passed. */
  validationError: string | null;
  /**
   * Counts *rejections* only. Re-submitting the same invalid file leaves the
   * message identical, which a live region cannot detect as a change, so this
   * gives the announcement a fresh identity and the retry is still spoken.
   *
   * Deliberately not incremented for a valid pick: the consumer may apply
   * `onFilesChange` asynchronously, and remounting the region before the new
   * `files` arrive would announce the *previous* selection first.
   */
  rejections: number;
  /** Validates an incoming selection, then either publishes it or reports why not. */
  acceptFiles: (files: readonly File[]) => void;
}

/**
 * Owns the one piece of state the control cannot delegate: whether the *last
 * attempted* selection was rejected. The accepted files themselves stay
 * controlled by the consumer, but a rejection produces no new value to control —
 * the message exists only inside the control, so it lives here.
 *
 * Both entry points (picker and drop) funnel through `acceptFiles`, so
 * drag-and-drop cannot bypass the type/size rules.
 */
export function useFileSelection(props: UiFileUploadInputProps): FileSelection {
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [rejections, setRejections] = React.useState<number>(0);
  const { accept, maxSizeBytes, multiple, onFilesChange, onValidationError } = props;

  const acceptFiles: FileSelection['acceptFiles'] = (files): void => {
    const result: FileValidationResult = validateFiles(files, { accept, maxSizeBytes, multiple });
    setValidationError(result.error);
    if (result.error != null) {
      setRejections((previous: number): number => previous + 1);
      onValidationError?.(result.error);
      return;
    }
    onFilesChange?.(result.accepted);
  };

  return { validationError, rejections, acceptFiles };
}
