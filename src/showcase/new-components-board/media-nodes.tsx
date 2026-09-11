import { Box } from '@mui/material';
import React from 'react';

import UiCalendarMultiSelect from '@/components/ui-calendar-multi-select';
import UiFileUploadInput from '@/components/ui-file-upload-input';
import UiPagination from '@/components/ui-pagination';

import { CAL_MONTH } from './fixtures';
import { CAL_HOVER_SX, PAGINATION_HOVER_SX, UPLOAD_HOVER_SX } from './styles';

// Builds a calendar tile on the fixed August-2022 month. Day-hover is pointer-
// gated, so it is forced onto one day through a wrapping `sx`.
export function calendarNode(opts: { value: string[]; hover?: boolean }): React.ReactElement {
  const cal = (
    <UiCalendarMultiSelect
      label="Доступні дати"
      defaultMonth={CAL_MONTH}
      locale="uk-UA"
      value={opts.value}
    />
  );
  return opts.hover ? <Box sx={CAL_HOVER_SX}>{cal}</Box> : cal;
}

// Builds a pagination bar. Cell-hover is pointer-gated, so it is forced onto one
// rest cell through a wrapping `sx`.
export function paginationNode(opts: {
  value: number;
  disabled?: boolean;
  hover?: boolean;
}): React.ReactElement {
  const bar = <UiPagination value={opts.value} count={7} disabled={opts.disabled} />;
  return opts.hover ? <Box sx={PAGINATION_HOVER_SX}>{bar}</Box> : bar;
}

// Builds a file-upload tile. Rest/hover carry an accept filter; disabled and error
// drop it, and error surfaces the helper text. Hover pill/stroke accents are forced
// through a wrapping `sx`.
export function uploadNode(opts: {
  hover?: boolean;
  disabled?: boolean;
  error?: boolean;
}): React.ReactElement {
  // Held in a local so the JSX line stays within the byte-based max-line-length
  // (each Cyrillic char is ~2 bytes).
  const errorText = 'Виникла помилка. Перевірте ще раз';
  const field = (
    <UiFileUploadInput
      files={[]}
      label="Логотип проєкту"
      buttonLabel="Завантажити"
      accept={opts.disabled || opts.error ? undefined : '.png,.jpg'}
      disabled={opts.disabled}
      error={opts.error}
      helperText={opts.error ? errorText : undefined}
    />
  );
  return opts.hover ? <Box sx={UPLOAD_HOVER_SX}>{field}</Box> : field;
}
