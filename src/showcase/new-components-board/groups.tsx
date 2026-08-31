import { FIELD_GROUPS } from './field-groups';
import { ITEM_ROW_GROUPS } from './item-row-group';
import { MEDIA_GROUPS } from './media-groups';
import { PROFILE_SELECT_CARD_GROUPS } from './profile-select-card-group';
import { TASK_CARD_GROUPS } from './task-card-group';
import type { GroupSpec } from './types';

// Every new Epic-2 control (the ones CRM/website lack) laid out at its exact Figma
// component width, in every state Figma draws. Prop-driven states render directly;
// interaction states Figma draws as separate frames (hover, open dropdown) are
// forced on statically. Everything is fluid below 480px (mobile).
export const GROUPS: GroupSpec[] = [
  ...FIELD_GROUPS,
  ...MEDIA_GROUPS,
  ...ITEM_ROW_GROUPS,
  ...TASK_CARD_GROUPS,
  ...PROFILE_SELECT_CARD_GROUPS,
];
