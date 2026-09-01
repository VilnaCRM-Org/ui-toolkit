import { ACTION_ICON_BAR_GROUPS } from './action-icon-bar-group';
import { FIELD_GROUPS } from './field-groups';
import { FILTER_CHIP_GROUPS } from './filter-chip-group';
import { INTEGRATION_CARD_GROUPS } from './integration-card-group';
import { ITEM_ROW_GROUPS } from './item-row-group';
import { MEDIA_GROUPS } from './media-groups';
import { NOTIFICATION_BADGE_GROUPS } from './notification-badge-group';
import { PAYMENT_OPTION_CARD_GROUPS } from './payment-option-card-group';
import { PIN_INPUT_GROUPS } from './pin-input-group';
import { PROFILE_SELECT_CARD_GROUPS } from './profile-select-card-group';
import { STATUS_BADGE_GROUPS } from './status-badge-group';
import { TASK_CARD_GROUPS } from './task-card-group';
import type { GroupSpec } from './types';

// Every new Epic-2 control and Epic-3 card (the ones CRM/website lack) laid out at
// its exact Figma component width, in every state Figma draws, in the board's own
// y-order. Prop-driven states render directly; interaction states Figma draws as
// separate frames (hover, press, open dropdown, open menu) are forced on statically.
// Everything is fluid below 480px (mobile).
export const GROUPS: GroupSpec[] = [
  ...FIELD_GROUPS,
  ...MEDIA_GROUPS,
  ...ITEM_ROW_GROUPS,
  ...TASK_CARD_GROUPS,
  ...PROFILE_SELECT_CARD_GROUPS,
  ...INTEGRATION_CARD_GROUPS,
  ...FILTER_CHIP_GROUPS,
  ...PIN_INPUT_GROUPS,
  ...PAYMENT_OPTION_CARD_GROUPS,
  ...ACTION_ICON_BAR_GROUPS,
  ...STATUS_BADGE_GROUPS,
  ...NOTIFICATION_BADGE_GROUPS,
];
