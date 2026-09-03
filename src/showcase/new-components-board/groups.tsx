import { ACTION_ICON_BAR_GROUPS } from './action-icon-bar-group';
import { ADD_BUTTON_GROUPS } from './add-button-group';
import { BACKGROUND_PICKER_GROUPS } from './background-picker-group';
import { BUTTON_DANGER_GROUPS } from './button-danger-group';
import { CHEVRON_BUTTON_GROUPS } from './chevron-button-group';
import { CLEAR_BUTTON_GROUPS } from './clear-button-group';
import { COPY_FIELD_GROUPS } from './copy-field-group';
import { FIELD_GROUPS } from './field-groups';
import { FILTER_CHIP_GROUPS } from './filter-chip-group';
import { INTEGRATION_CARD_GROUPS } from './integration-card-group';
import { ITEM_ROW_GROUPS } from './item-row-group';
import { MEDIA_GROUPS } from './media-groups';
import { NOTIFICATION_BADGE_GROUPS } from './notification-badge-group';
import { OPTION_CARD_GROUPS } from './option-card-group';
import { PAYMENT_OPTION_CARD_GROUPS } from './payment-option-card-group';
import { PIN_INPUT_GROUPS } from './pin-input-group';
import { PROFILE_SELECT_CARD_GROUPS } from './profile-select-card-group';
import { SEGMENTED_CONTROL_GROUPS } from './segmented-control-group';
import { SOCIAL_ICON_BUTTON_GROUPS } from './social-icon-button-group';
import { STATUS_BADGE_GROUPS } from './status-badge-group';
import { TASK_CARD_GROUPS } from './task-card-group';
import type { GroupSpec } from './types';

// Every new Epic-2/Epic-3/Story-3.7 control (the ones CRM/website lack) laid
// out at its exact Figma component width, in every state Figma draws, in
// the board's own y-order. Prop-driven states render directly; interaction
// states Figma draws as separate frames (hover, press, open dropdown) are
// forced on statically. Everything is fluid below 480px (mobile).
export const GROUPS: GroupSpec[] = [
  ...FIELD_GROUPS,
  ...MEDIA_GROUPS,
  ...ITEM_ROW_GROUPS,
  ...TASK_CARD_GROUPS,
  ...PROFILE_SELECT_CARD_GROUPS,
  ...INTEGRATION_CARD_GROUPS,
  ...SOCIAL_ICON_BUTTON_GROUPS,
  ...FILTER_CHIP_GROUPS,
  ...PIN_INPUT_GROUPS,
  ...PAYMENT_OPTION_CARD_GROUPS,
  ...BACKGROUND_PICKER_GROUPS,
  ...BUTTON_DANGER_GROUPS,
  ...ACTION_ICON_BAR_GROUPS,
  ...OPTION_CARD_GROUPS,
  ...CHEVRON_BUTTON_GROUPS,
  ...ADD_BUTTON_GROUPS,
  ...CLEAR_BUTTON_GROUPS,
  ...COPY_FIELD_GROUPS,
  ...STATUS_BADGE_GROUPS,
  ...NOTIFICATION_BADGE_GROUPS,
  ...SEGMENTED_CONTROL_GROUPS,
];
