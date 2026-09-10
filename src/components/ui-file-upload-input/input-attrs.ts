import { hasText } from '../field-controls';

import type { FileUploadModel } from './field-model';
import type { UiFileUploadInputProps } from './types';

export interface FileUploadIds {
  input: string;
  /** On the field surface, so a consumer can scroll to or highlight the control. */
  dropzone: string;
  label: string;
  buttonText: string;
  message: string;
}

/**
 * Everything the native input needs, flattened into one object so the JSX that
 * applies it stays shallow — the repo forbids prop-spreading, so each attribute
 * is written out, and a flat source keeps that block within the complexity
 * budget.
 */
export interface FileInputAttrs {
  id: string;
  accept: string | undefined;
  multiple: boolean | undefined;
  disabled: boolean | undefined;
  /** `aria-required`, not the native attribute — see the `required` prop doc. */
  ariaRequired: true | undefined;
  labelledBy: string | undefined;
  ariaLabel: string | undefined;
  describedBy: string | undefined;
  /** `undefined` rather than `false`, so a valid field carries no attribute. */
  invalid: true | undefined;
}

export function buildIds(baseId: string): FileUploadIds {
  return {
    input: `${baseId}-input`,
    dropzone: `${baseId}-dropzone`,
    label: `${baseId}-label`,
    buttonText: `${baseId}-button-text`,
    message: `${baseId}-message`,
  };
}

// The name references *both* the visible label and the pill's own text, so the
// announced name ("Project logo Choose file") contains the visible words a
// speech-input user would say (WCAG 2.5.3) as well as the field's purpose
// (WCAG 3.3.2). Without a visible label the pill's `<label>` still names the
// input, so the control is never anonymous.
function labelledBy(named: boolean, ids: FileUploadIds): string | undefined {
  return named ? `${ids.label} ${ids.buttonText}` : undefined;
}

export function buildInputAttrs(
  props: UiFileUploadInputProps,
  ids: FileUploadIds,
  model: FileUploadModel
): FileInputAttrs {
  const named: boolean = hasText(props.label);

  return {
    id: ids.input,
    accept: props.accept,
    multiple: props.multiple,
    disabled: props.disabled,
    ariaRequired: props.required === true ? true : undefined,
    labelledBy: labelledBy(named, ids),
    ariaLabel: named ? undefined : props['aria-label'],
    describedBy: model.message == null ? undefined : ids.message,
    invalid: model.invalid ? true : undefined,
  };
}
