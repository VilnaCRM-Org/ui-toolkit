import { Box } from '@mui/material';
import React from 'react';

import { UiFileUploadInput, UiPagination } from '@/components';

import type { GroupSpec } from './types';

// Forced page-cell hover: the theme scopes the light-blue fill to `:hover`, so a
// static tile re-applies the Figma hover recipe (Primary @10% fill, no border,
// Primary ink) to one rest cell (page 3), found by its accessible name.
const PAGINATION_HOVER_SX = {
  '& [aria-label="Сторінка 3"]': {
    backgroundColor: 'rgba(30, 174, 255, 0.1)',
    borderColor: 'transparent',
    color: '#1EAEFF',
  },
} as const;
const UPLOAD_HOVER_SX = {
  '& .ui-file-upload-pill': { backgroundColor: '#00A3FF' },
  // Hover also darkens the field stroke grey400 -> grey300 (the theme's `:hover`
  // recipe), which a statically-forced tile must re-apply itself.
  '& .ui-file-upload-dropzone': { borderColor: '#969B9D' },
} as const;

// Forced hover tiles: both hover recipes live behind `:hover`, so a statically
// captured tile re-applies them itself (Figma draws hover as its own frame).
const PAGINATION_HOVER_TILE: React.ReactElement = (
  <Box sx={PAGINATION_HOVER_SX}>
    <UiPagination value={1} count={7} />
  </Box>
);
const UPLOAD_HOVER_TILE: React.ReactElement = (
  <Box sx={UPLOAD_HOVER_SX}>
    <UiFileUploadInput
      files={[]}
      label="Логотип проєкту"
      buttonLabel="Загрузити"
      accept=".png,.jpg"
    />
  </Box>
);

export const PAGINATION_GROUP: GroupSpec = {
  title: 'Пагінація',
  width: 685,
  states: [
    { label: 'Rest', node: <UiPagination value={1} count={7} /> },
    { label: 'Hover', node: PAGINATION_HOVER_TILE },
    { label: 'Current', node: <UiPagination value={2} count={7} /> },
    { label: 'Disabled', node: <UiPagination value={2} count={7} disabled /> },
  ],
};

export const UPLOAD_GROUP: GroupSpec = {
  title: 'Завантаження файлу',
  width: 422,
  states: [
    {
      label: 'Rest',
      node: (
        <UiFileUploadInput
          files={[]}
          label="Логотип проєкту"
          buttonLabel="Загрузити"
          accept=".png,.jpg"
        />
      ),
    },
    { label: 'Hover', node: UPLOAD_HOVER_TILE },
    {
      label: 'Disabled',
      node: (
        <UiFileUploadInput files={[]} label="Логотип проєкту" buttonLabel="Загрузити" disabled />
      ),
    },
    {
      label: 'Error',
      node: (
        <UiFileUploadInput
          files={[]}
          label="Логотип проєкту"
          buttonLabel="Загрузити"
          error
          helperText="Виникла помилка. Перевірте ще раз"
        />
      ),
    },
  ],
};
