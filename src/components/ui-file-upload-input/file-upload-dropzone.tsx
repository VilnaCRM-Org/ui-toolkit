import { Box } from '@mui/material';
import React from 'react';

import NativeFileInput from './native-file-input';
import { dropzoneSx, fileTextSx } from './styles';
import type { UiFileUploadInputProps } from './types';
import type { DragAndDrop } from './use-drag-and-drop';
import type { FileUploadField } from './use-file-upload-field';

export interface FileUploadDropzoneProps {
  field: FileUploadField;
  upload: UiFileUploadInputProps;
  drag: DragAndDrop;
  onFiles: (files: readonly File[]) => void;
}

/**
 * The bordered field from the Figma "Input" node, doubling as the drop target:
 * the selected-file text on the left, the picker pill on the right. Drag-and-drop
 * lives on this wrapper rather than the input so the whole field is the target,
 * which is what a user dragging a file expects to aim at.
 */
function FileUploadDropzone({
  field,
  upload,
  drag,
  onFiles,
}: FileUploadDropzoneProps): React.ReactElement {
  return (
    <Box
      id={field.ids.dropzone}
      className="ui-file-upload-dropzone"
      sx={dropzoneSx(drag.active, field.model.invalid, field.model.disabled)}
      onDragEnter={drag.onDragEnter}
      onDragOver={drag.onDragOver}
      onDragLeave={drag.onDragLeave}
      onDrop={drag.onDrop}
    >
      <Box
        component="span"
        className="ui-file-upload-name"
        sx={fileTextSx(field.model.hasSelection)}
      >
        {field.model.displayText}
      </Box>
      <NativeFileInput field={field} upload={upload} onFiles={onFiles} />
    </Box>
  );
}

export default FileUploadDropzone;
