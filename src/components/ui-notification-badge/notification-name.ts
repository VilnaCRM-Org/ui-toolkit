// The accessible-name composition for UiNotificationBadge (a11y contract §6,
// Ruling 5). It is its own module because the format is the contract: the name is
// built from the DISPLAY string, never the raw count, so the visible "9+" is
// contained in the name (WCAG 2.5.3), and it carries NO plural word — Ukrainian
// plural forms make a baked-in "unread"/"непрочитаних" a localization defect, so
// consumers needing prose override `label` instead.

/** Ukrainian default, per the repo's Ukrainian-defaults rule (Ruling 7). */
export const DEFAULT_LABEL: string = 'Сповіщення';

export interface NotificationNameInput {
  label: string | undefined;
  count: number;
  display: string;
}

// Nullish-coerced only: a blank override is NOT repaired here, because silently
// substituting the default would hide the misconfiguration the dev warning exists
// to report.
function resolveLabel(label: string | undefined): string {
  return label ?? DEFAULT_LABEL;
}

/**
 * `"Сповіщення: 1"` / `"Сповіщення: 9+"` while something is unread, and the
 * bare label once the count is zero — at which point no chip is rendered
 * either, so a count in the name would describe a control that shows none.
 */
export function notificationName(input: Readonly<NotificationNameInput>): string {
  const label: string = resolveLabel(input.label);
  return input.count > 0 ? `${label}: ${input.display}` : label;
}
