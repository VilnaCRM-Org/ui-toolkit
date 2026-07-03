// True when a label is a real, non-blank string. Used so an empty/whitespace
// `label` still falls back to `aria-label` for the field's accessible name
// (`null`/`undefined`-only checks would treat `''` as a valid visible label and
// drop the fallback, leaving the combobox unnamed).
export function hasText(value: string | undefined): boolean {
  return value != null && value.trim() !== '';
}
