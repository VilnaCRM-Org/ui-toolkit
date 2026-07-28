import { crmBreakpointValues } from '@/components/ui-breakpoints';

export const MOBILE_MAX = `@media (max-width: ${crmBreakpointValues.sm}px)` as const;

export interface Option {
  label: string;
  value: string;
}

// Ukrainian sample data mirroring the Figma frames.
export const CITIES: Option[] = [
  { label: 'Київ', value: 'kyiv' },
  { label: 'Львів', value: 'lviv' },
  { label: 'Одеса', value: 'odesa' },
  { label: 'Харків', value: 'kharkiv' },
];
export const ROLES: Option[] = [
  { label: 'UX designer', value: 'ux' },
  { label: 'Розробник', value: 'dev' },
  { label: 'Дизайнер', value: 'design' },
  { label: 'Менеджер', value: 'manager' },
];
export const PICKED: Option[] = [ROLES[0], ROLES[2]];
// Three chips wrap onto two rows (the chevron + clear-X reserve the right edge).
export const PICKED3: Option[] = [ROLES[0], ROLES[1], ROLES[2]];
export const CONTACT: Option[] = [
  { label: 'Електронна пошта', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Сповіщення', value: 'push' },
];
// Wrapped one item per line: on a single line the Cyrillic literals push the row
// past the byte-based max-line-length (each Cyrillic char is ~2 bytes), so keep the
// natural array shape and stop Prettier from recollapsing it.
// prettier-ignore
export const SUGGESTIONS = [
  'Топ продажники',
  'Топ продажі за місяць',
  'Топ продажі за рік',
];

// Calendar showcase states, all on August 2022 — it starts on a Monday and has 31
// days, so its last row reads 29 30 31 1 2 3 4 (matching the Figma frame). Rest: a
// single selected day. Active: a clean in-month range (1–5) so both endpoints show.
// Active (other month): a range that starts in-month and runs past its end, so the
// next month's leading days fall in range.
export const CAL_MONTH = '2022-08-01';
export const CAL_REST = ['2022-08-01'];
export const CAL_ACTIVE = ['2022-08-01', '2022-08-05'];
export const CAL_ACTIVE_OTHER = ['2022-08-01', '2022-09-10'];

// The assignee photo from the Figma task-card master (34x34 PNG), inlined as a
// data URI so the showcase board and the UiTaskCard story render the exact design
// pixels with no asset pipeline. Split across lines to stay inside max-len.
export const TASK_AVATAR_SRC: string =
  'data:image/png;base64,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';
