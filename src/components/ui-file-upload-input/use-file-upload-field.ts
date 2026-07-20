import React from 'react';

import { hasText } from '../field-controls';

import { buildUploadAnnouncement } from './announce';
import { buildFileUploadModel, type FileUploadModel } from './field-model';
import { buildIds, buildInputAttrs, type FileInputAttrs, type FileUploadIds } from './input-attrs';
import type { FileSelection } from './use-file-selection';
import type { UiFileUploadInputProps } from './types';

export interface FileUploadField {
  ids: FileUploadIds;
  /** Whether a visible `label` supplies the accessible name. */
  named: boolean;
  inputAttrs: FileInputAttrs;
  model: FileUploadModel;
  announcement: string;
  /** Remounts the live region so a repeated, identical message is re-announced. */
  announcementKey: number;
}

/**
 * Derives the id wiring, the native input's attributes and the live-region text,
 * keeping the component itself small enough for the complexity gate.
 */
export function useFileUploadField(
  props: UiFileUploadInputProps,
  selection: FileSelection
): FileUploadField {
  const validationError: string | null = selection.validationError;
  // `useId` must run every render (Rules of Hooks); a caller-supplied `id` wins.
  const reactId: string = React.useId();
  const ids: FileUploadIds = buildIds(props.id ?? reactId);
  const model: FileUploadModel = buildFileUploadModel(props, validationError);

  return {
    ids,
    named: hasText(props.label),
    inputAttrs: buildInputAttrs(props, ids, model),
    model,
    announcement: buildUploadAnnouncement(props.status ?? 'idle', model.fileNames, validationError),
    announcementKey: selection.attempt,
  };
}
