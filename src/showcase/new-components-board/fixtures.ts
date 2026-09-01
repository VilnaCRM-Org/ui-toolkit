import type { ActionIconName } from '@/components/ui-action-icon-bar/types';
import { crmBreakpointValues } from '@/components/ui-breakpoints';
import type { IntegrationLogo } from '@/components/ui-integration-card/types';
import type { ProfileSelectItem } from '@/components/ui-profile-select-card/types';

import boardAvatars from './board-avatars.json';
import boardLogos from './board-logos.json';

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

// The two brand marks the integration-card masters draw, as 2x cover-crops of the
// Figma image fills (278x80 and 362x104, rendered at half size). Both ship as data
// URIs so the exact design pixels travel with no asset pipeline; the base64
// payloads live in the sibling JSON asset for the same reason the avatars do.
export const HUBSPOT_LOGO_SRC: string = `data:image/png;base64,${boardLogos.hubspot}`;
export const AMOCRM_LOGO_SRC: string = `data:image/png;base64,${boardLogos.amocrm}`;

/** One integration the board and the component story paint. */
export interface IntegrationSample {
  name: string;
  logo: IntegrationLogo;
}

// Verbatim from the masters, capitalisation included ("Hubspot", not "HubSpot"):
// the card bakes in no literals of its own (a11y contract §2.2), so the brand name
// and the mark's intrinsic size are consumer data.
export const INTEGRATION_CARDS: [IntegrationSample, IntegrationSample] = [
  { name: 'Hubspot', logo: { src: HUBSPOT_LOGO_SRC, width: 139, height: 40 } },
  { name: 'AmoCRM', logo: { src: AMOCRM_LOGO_SRC, width: 181, height: 52 } },
];

// The two provider wordmarks the payment-option-card masters draw, as 2x exports
// of the Figma image fills (232x48 and 374x134, rendered at half size). The grey
// LiqPay mark is a separate ASSET rather than a CSS filter, because `grayscale(1)`
// and `opacity` both miss Figma's flat #D0D4D8 badly. Same delivery as the
// integration marks: raw base64 in the sibling JSON, prefixed once here.
export const LIQPAY_LOGO_SRC: string = `data:image/png;base64,${boardLogos.liqpay}`;
export const LIQPAY_GREY_LOGO_SRC: string = `data:image/png;base64,${boardLogos.liqpayGrey}`;
export const WAYFORPAY_LOGO_SRC: string = `data:image/png;base64,${boardLogos.wayforpay}`;

/** One payment provider the board and the component story paint. */
export interface PaymentSample {
  name: string;
  logo: IntegrationLogo;
  /** The flat-grey mark painted while disabled; falls back to `logo` when absent. */
  logoDisabled?: IntegrationLogo | undefined;
}

// The card carries ZERO text nodes, so `name` is its entire accessible name and
// must transcribe the visible wordmark (SC 2.5.3) — brand names and marks travel
// as consumer data (SC 3.1.2), exactly as the integration cards do. WayForPay
// ships no grey master, which is why only LiqPay carries `logoDisabled`.
export const PAYMENT_OPTIONS: [PaymentSample, PaymentSample] = [
  {
    name: 'LiqPay',
    logo: { src: LIQPAY_LOGO_SRC, width: 116, height: 24 },
    logoDisabled: { src: LIQPAY_GREY_LOGO_SRC, width: 116, height: 24 },
  },
  { name: 'WayForPay', logo: { src: WAYFORPAY_LOGO_SRC, width: 187, height: 67 } },
];

// The filter chip's own sample string, verbatim from the Figma "Tags" master
// (curly quotes U+201C/U+201D included) so the baseline matches the design. The
// two segments are two props because Figma paints them in different colours.
export const CHIP_LABEL: string = 'Фильтр:';
export const CHIP_VALUE: string = 'Комментар - “клиент”';

/** One action slot the icon-bar tiles paint, in Figma row order. */
export interface ActionSample {
  icon: ActionIconName;
  label: string;
}

// Icon-only buttons have no visible text, so every label here is the action's
// whole accessible name. The eye's label is CONSTANT across both toggle states —
// `aria-pressed` already carries the state, so a state-describing label would
// double-signal it.
export const BAR_ACTIONS: [
  ActionSample,
  ActionSample,
  ActionSample,
  ActionSample,
  ActionSample,
  ActionSample,
] = [
  { icon: 'x-close', label: 'Закрити' },
  { icon: 'dots-horizontal', label: 'Більше дій' },
  { icon: 'dots-vertical', label: 'Меню рядка' },
  { icon: 'eye', label: 'Видимість' },
  { icon: 'settings', label: 'Налаштування' },
  { icon: 'trash', label: 'Видалити' },
];

// A half-entered code, so the six-cell tile shows both digit inks at once: the
// entered digits in darkPrimary and the empty cells on the grey "0" placeholder
// the master paints in every state.
export const PIN_SAMPLE: string = '426';
export const PIN_ERROR_TEXT: string = 'Невірний код. Спробуйте ще раз';
