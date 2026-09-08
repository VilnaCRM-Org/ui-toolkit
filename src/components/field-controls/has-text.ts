// True when a label is a real, non-blank string. The `typeof` test is not
// belt-and-braces: these checks back the dev warnings, whose whole job is to
// survive runtime data that violates the prop types (a CMS number, say), so a
// bare `.trim()` here would throw instead of reporting the misconfiguration.
//
// Used so an empty/whitespace
// `label` still falls back to `aria-label` for the field's accessible name
// (`null`/`undefined`-only checks would treat `''` as a valid visible label and
// drop the fallback, leaving the combobox unnamed).
export function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== '';
}
