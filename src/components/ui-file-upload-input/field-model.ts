import type React from 'react';

import type { UiFileUploadInputProps } from './types';

const DEFAULT_PLACEHOLDER: string = 'No file selected';
const NO_FILES: readonly File[] = [];

export interface FileUploadModel {
  /** Names of the currently selected files, in selection order. */
  fileNames: string[];
  /** What the field shows: the selected names, else the placeholder. */
  displayText: string;
  /** The described-by message: a validation error outranks the helper text. */
  message: React.ReactNode;
  /** Whether the field should render and report itself as invalid. */
  invalid: boolean;
  /** Normalised here so the presentational components carry no boolean coercion. */
  disabled: boolean;
}

// A validation rejection, an explicit `error` and a failed upload are three
// different ways into the same invalid presentation; folding them here keeps the
// component from re-deriving the condition per element.
function isInvalid(props: UiFileUploadInputProps, validationError: string | null): boolean {
  return validationError != null || props.error === true || props.status === 'error';
}

function nameOf(file: File): string {
  return file.name;
}

/** Derives everything rendered from the props plus the internal validation state. */
export function buildFileUploadModel(
  props: UiFileUploadInputProps,
  validationError: string | null
): FileUploadModel {
  const fileNames: string[] = (props.files ?? NO_FILES).map(nameOf);
  const selected: string = fileNames.join(', ');
  const placeholder: string = props.placeholder ?? DEFAULT_PLACEHOLDER;

  return {
    fileNames,
    displayText: selected === '' ? placeholder : selected,
    message: validationError ?? props.helperText,
    invalid: isInvalid(props, validationError),
    disabled: props.disabled === true,
  };
}
