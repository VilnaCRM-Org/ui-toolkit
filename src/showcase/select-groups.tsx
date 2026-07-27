import { Box } from '@mui/material';
import React from 'react';

import { UiMultiSelect, UiSelectWithSearch } from '@/components';

import type { GroupSpec } from './types';

const CITIES = [
  { label: 'Київ', value: 'kyiv' },
  { label: 'Львів', value: 'lviv' },
  { label: 'Одеса', value: 'odesa' },
  { label: 'Харків', value: 'kharkiv' },
];
const ROLES = [
  { label: 'UX designer', value: 'ux' },
  { label: 'Розробник', value: 'dev' },
  { label: 'Дизайнер', value: 'design' },
  { label: 'Менеджер', value: 'manager' },
];
const PICKED = [ROLES[0], ROLES[2]];
// Three chips wrap onto two rows (the chevron + clear-X reserve the right edge).
const PICKED3 = [ROLES[0], ROLES[1], ROLES[2]];

const SELECT_HOVER_SX = {
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D0D4D8' },
} as const;
// Forced chip-hover: a 1px brand-blue border + the × filled into a blue circle with
// a white glyph (Figma node 622:44563).
const MS_CHIP_HOVER_SX = {
  '& .MuiChip-root': { borderColor: '#1EAEFF' },
  '& .ui-chip-x': { backgroundColor: '#1EAEFF', color: '#FFFFFF' },
} as const;

// Forced hover tiles: the theme scopes these visuals to `:hover`, so a statically
// captured tile has to re-apply them itself (Figma draws hover as its own frame).
const SELECT_HOVER_TILE: React.ReactElement = (
  <Box sx={SELECT_HOVER_SX}>
    <UiSelectWithSearch options={CITIES} aria-label="Місто" placeholder="Оберіть місто" />
  </Box>
);
const MULTISELECT_HOVER_TILE: React.ReactElement = (
  <Box sx={MS_CHIP_HOVER_SX}>
    <UiMultiSelect options={ROLES} value={PICKED} label="Роль" placeholder="Почніть вводити" />
  </Box>
);

export const SELECT_GROUP: GroupSpec = {
  title: 'Select з пошуком',
  width: 262,
  states: [
    {
      label: 'Rest',
      node: <UiSelectWithSearch options={CITIES} aria-label="Місто" placeholder="Оберіть місто" />,
    },
    { label: 'Hover', node: SELECT_HOVER_TILE },
    {
      label: 'Open',
      tall: true,
      node: (
        <UiSelectWithSearch
          options={CITIES}
          aria-label="Місто"
          placeholder="Оберіть місто"
          open
          disablePortal
        />
      ),
    },
  ],
};

export const MULTISELECT_GROUP: GroupSpec = {
  title: 'Multiselect',
  width: 430,
  states: [
    {
      label: 'Filled',
      node: (
        <UiMultiSelect options={ROLES} value={PICKED} label="Роль" placeholder="Почніть вводити" />
      ),
    },
    {
      label: 'Filled ×3',
      node: (
        <UiMultiSelect options={ROLES} value={PICKED3} label="Роль" placeholder="Почніть вводити" />
      ),
    },
    { label: 'Item hover', node: MULTISELECT_HOVER_TILE },
    {
      label: 'Empty',
      node: <UiMultiSelect options={ROLES} value={[]} label="Роль" placeholder="Почніть вводити" />,
    },
    {
      label: 'Open',
      tall: true,
      node: (
        <UiMultiSelect
          options={ROLES}
          value={PICKED}
          label="Роль"
          placeholder="Почніть вводити"
          open
          disablePortal
        />
      ),
    },
  ],
};
