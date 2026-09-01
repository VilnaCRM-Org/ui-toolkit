import type { UiFilterChipProps } from './types';

const BLANK_SUBJECT_WARNING: string =
  'UiFilterChip received a blank `label` AND a blank `filterValue`; the removal action would ' +
  'have no subject in its accessible name, leaving a button that reads as bare boilerplate. ' +
  'Pass the filter prefix, the filter value, or both.';
const BLANK_REMOVE_LABEL_WARNING: string =
  'UiFilterChip received a blank `removeLabel`; the accessible name loses its action semantics ' +
  'and the chip reads as a static label. Omit the prop to keep the default suffix, or pass ' +
  'wording that names the removal.';

// The visible text is the whole subject of the name (the glyph is decorative and
// the hidden suffix only carries the verb), so both segments blank leaves the
// button named "видалити фільтр" with nothing to remove.
function blankSubjectWarning(props: UiFilterChipProps): string | null {
  if (props.label?.trim() || props.filterValue?.trim()) {
    return null;
  }
  return BLANK_SUBJECT_WARNING;
}

// A nullish `removeLabel` is not an override — it falls back to the default
// suffix. Only an explicitly blank string is the misconfiguration.
function removeLabelWarning(props: UiFilterChipProps): string | null {
  if (props.removeLabel == null) {
    return null;
  }
  return props.removeLabel.trim() ? null : BLANK_REMOVE_LABEL_WARNING;
}

/** The first applicable accessible-name warning, or null when all is well. */
export default function filterChipWarning(props: UiFilterChipProps): string | null {
  return blankSubjectWarning(props) ?? removeLabelWarning(props);
}
