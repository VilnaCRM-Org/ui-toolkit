import type { UiChevronButtonProps } from './types';

const BLANK_LABEL_WARNING: string =
  'UiChevronButton received a blank `label`; icon-only buttons have no visible text, so ' +
  '`aria-label` is their ONLY accessible name. Pass a label describing the direction, e.g. ' +
  "'Наступна сторінка'.";

/** The dev-only accessible-name warning, or null when the label is healthy. */
export default function chevronButtonWarning(props: UiChevronButtonProps): string | null {
  return props.label?.trim() ? null : BLANK_LABEL_WARNING;
}
