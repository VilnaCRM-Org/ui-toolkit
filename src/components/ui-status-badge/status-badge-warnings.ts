import type { UiStatusBadgeProps } from './types';

const BLANK_LABEL_WARNING: string =
  'UiStatusBadge received a blank `label`; the badge would be a nameless image (static) or a ' +
  'nameless button (wired) — it has no text of its own to fall back on. Pass a label that ' +
  'names the painted state when static, or a constant, state-free one when wired.';

// The ONLY warning this component has, and the asymmetry with UiIntegrationCard
// is deliberate: `active` supplied WITHOUT `onToggle` is legal here and must
// never warn. A static badge is a `role="img"` whose required label is itself the
// programmatic exposure of the state (spec Ruling 4), so — unlike the 3.4 static
// card, which would paint a checked glyph behind no `aria-checked` — nothing is
// painted here that assistive tech cannot read. Do not copy 3.4's
// unwired-selected warning into this file.
function blankLabelWarning(props: UiStatusBadgeProps): string | null {
  return props.label?.trim() ? null : BLANK_LABEL_WARNING;
}

/** The first applicable dev warning, or null when the props are sound. */
export default function statusBadgeWarning(props: UiStatusBadgeProps): string | null {
  return blankLabelWarning(props);
}
