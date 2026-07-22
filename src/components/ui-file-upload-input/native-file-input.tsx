import { Box } from '@mui/material';
import React from 'react';

import { FolderGlyph } from './folder-glyph';
import type { FileInputAttrs } from './input-attrs';
import styles from './styles';
import type { UiFileUploadInputProps } from './types';
import type { FileUploadField } from './use-file-upload-field';

const DEFAULT_BUTTON_LABEL: string = 'Upload';

export interface NativeFileInputProps {
  field: FileUploadField;
  upload: UiFileUploadInputProps;
  onFiles: (files: readonly File[]) => void;
}

// Split out of NativeFileInput so neither function exceeds the Halstead-volume
// budget; carries the input's native attributes plus its aria wiring.
function renderFileInput(
  attrs: FileInputAttrs,
  inputRef: React.RefObject<HTMLInputElement | null>,
  onChange: React.ChangeEventHandler<HTMLInputElement>
): React.ReactElement {
  return (
    <input
      ref={inputRef}
      className="ui-file-upload-native"
      type="file"
      id={attrs.id}
      accept={attrs.accept}
      multiple={attrs.multiple}
      disabled={attrs.disabled}
      aria-required={attrs.ariaRequired}
      aria-labelledby={attrs.labelledBy}
      aria-label={attrs.ariaLabel}
      aria-describedby={attrs.describedBy}
      aria-invalid={attrs.invalid}
      onChange={onChange}
    />
  );
}

/**
 * The real control: a native `<input type="file">` inside the `<label>` painted
 * as the Figma pill. The label opens the OS picker on click for free, and the
 * input keeps native keyboard operation and the platform's "file upload button"
 * semantics — none of it re-implemented. It is clipped rather than hidden so it
 * stays focusable and present in the accessibility tree.
 */
function NativeFileInput({ field, upload, onFiles }: NativeFileInputProps): React.ReactElement {
  const inputRef: React.RefObject<HTMLInputElement | null> = React.useRef<HTMLInputElement>(null);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event): void => {
    onFiles(Array.from(event.target.files ?? []));
    // Clearing the native value lets the *same* file be chosen again: a repeat
    // pick of an identical path fires no `change` event otherwise, which would
    // strand a user retrying after a failed upload.
    if (inputRef.current != null) {
      inputRef.current.value = '';
    }
  };

  return (
    <Box component="label" className="ui-file-upload-pill" sx={styles.pill}>
      <FolderGlyph />
      <span id={field.ids.buttonText}>{upload.buttonLabel ?? DEFAULT_BUTTON_LABEL}</span>
      {renderFileInput(field.inputAttrs, inputRef, handleChange)}
    </Box>
  );
}

export default NativeFileInput;
