import { crmBreakpointValues } from '@/components/ui-breakpoints';
import type { ProfileSelectItem } from '@/components/ui-profile-select-card/types';

import boardAvatars from './board-avatars.json';

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
// Tuple-typed so the fixed picks below stay definite `Option`s under
// `noUncheckedIndexedAccess`.
export const ROLES: [Option, Option, Option, Option] = [
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

// The two design photos the board and the component stories paint: the assignee
// from the Figma task-card master (34x34 PNG) and the profile from the
// profile-select-card master (64x64 PNG, the 2x export of the 32px master
// ellipse). Both render as data URIs so the exact design pixels ship with no
// asset pipeline. The base64 payloads themselves live in a sibling JSON asset —
// they are data, not code, and two 40-line literal concatenations read to a
// duplication checker as one block copied twice.
export const TASK_AVATAR_SRC: string = `data:image/png;base64,${boardAvatars.task}`;
export const PROFILE_AVATAR_SRC: string = `data:image/png;base64,${boardAvatars.profile}`;

// The three commands the profile-select-card master draws. The component bakes in
// no literals (a11y contract §2.2), so the labels travel as consumer data — these
// are the master's own, shared by the showcase board and the component story.
export const PROFILE_ITEMS: ProfileSelectItem[] = [
  { id: 'profile', label: 'Мой профиль' },
  { id: 'settings', label: 'Настройки' },
  { id: 'logout', label: 'Выйти' },
];
