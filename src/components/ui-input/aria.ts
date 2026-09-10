import { hasHelperContent, hasText } from '../field-controls';

import type { UiInputProps } from './types';

/** The native-input ARIA this control owns, flattened for a shallow JSX apply. */
export interface InputAriaAttrs {
  'aria-describedby'?: string;
  'aria-required'?: true;
}

// MUI derives the helper text's id from the field id, and only when a field id
// exists — which is why the component supplies one whenever it has to write
// `aria-describedby` itself.
//
// Gated on `hasHelperContent`, not on `!= null`: React renders both booleans and
// blank strings as nothing, so the ubiquitous `helperText={hasError && message}`
// idiom collapses to `false` and mounts NO helper element. Synthesising the id
// anyway would point `aria-describedby` at an element that does not exist —
// exactly the failure that predicate was written to prevent.
function helperTextId(props: Readonly<UiInputProps>, fieldId: string | undefined): string | null {
  return hasHelperContent(props.helperText) && hasText(fieldId) ? `${fieldId}-helper-text` : null;
}

/**
 * `aria-describedby` for the native input: MUI's own helper-text id FIRST, then
 * the consumer's. Order matters — the helper text carries the reason a field is
 * invalid, which should be announced before any supplementary description.
 *
 * Composing rather than replacing is the whole point: writing only the
 * consumer's id would silently unlink `helperText`, so an error message would
 * stop being announced the moment a description was added.
 */
export function inputDescribedBy(
  props: Readonly<UiInputProps>,
  fieldId: string | undefined
): string | undefined {
  // Trimmed before the emptiness test: a whitespace-only `describedBy` would
  // otherwise survive as an idref that matches no element.
  const ids: string[] = [helperTextId(props, fieldId), props.describedBy ?? null]
    .map((id: string | null): string => id?.trim() ?? '')
    .filter((id: string): boolean => id.length > 0);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/**
 * `aria-required` is written alongside the native `required` MUI already sets.
 * The native attribute alone is what the field validates on; the ARIA one is
 * what the toolkit's other controls expose (`ui-file-upload-input`), and what
 * consumers assert against.
 */
export function inputAria(
  props: Readonly<UiInputProps>,
  fieldId: string | undefined
): InputAriaAttrs {
  const describedBy: string | undefined = inputDescribedBy(props, fieldId);
  const required: true | undefined = props.required === true ? true : undefined;
  // Each key is OMITTED when it has no value, never written as `undefined`.
  // Object spread treats an explicitly-undefined key as present, so the
  // always-write form let `required` alone (no helper text, no `describedBy`)
  // spread `'aria-describedby': undefined` over a description the consumer had
  // set through `slotProps.input` — silently unlinking it.
  return {
    ...(describedBy !== undefined && { 'aria-describedby': describedBy }),
    ...(required !== undefined && { 'aria-required': required }),
  };
}
