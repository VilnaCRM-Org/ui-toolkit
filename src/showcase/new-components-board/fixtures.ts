import { crmBreakpointValues } from '@/components/ui-breakpoints';
import type { ProfileSelectItem } from '@/components/ui-profile-select-card/types';

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

// The profile photo from the Figma profile-select-card master (64x64 PNG, the
// 2x export of the 32px master ellipse), inlined as a data URI so the showcase
// board and the UiProfileSelectCard story render the exact design pixels with no
// asset pipeline. Split across lines to stay inside max-len.
export const PROFILE_AVATAR_SRC: string =
  'data:image/png;base64,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' +
  'egGn6czLAAAAAElFTkSuQmCC';

// The three commands the profile-select-card master draws. The component bakes in
// no literals (a11y contract §2.2), so the labels travel as consumer data — these
// are the master's own, shared by the showcase board and the component story.
export const PROFILE_ITEMS: ProfileSelectItem[] = [
  { id: 'profile', label: 'Мой профиль' },
  { id: 'settings', label: 'Настройки' },
  { id: 'logout', label: 'Выйти' },
];
