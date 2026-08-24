import { Box } from '@mui/material';
import React from 'react';

import { UiMultiSelect, UiRadioGroup, UiSelectWithSearch } from '@/components';

import { CITIES, CONTACT, ROLES, type Option } from './fixtures';
import { MS_CHIP_HOVER_SX, SELECT_HOVER_SX } from './styles';

// Builds a select-with-search tile. Open renders the dropdown inline; hover is
// pointer-gated, so it is forced through a wrapping `sx`.
export function selectNode(opts: { hover?: boolean; open?: boolean }): React.ReactElement {
  const field = (
    <UiSelectWithSearch
      options={CITIES}
      aria-label="Місто"
      placeholder="Оберіть місто"
      open={opts.open || undefined}
      disablePortal={opts.open || undefined}
    />
  );
  return opts.hover ? <Box sx={SELECT_HOVER_SX}>{field}</Box> : field;
}

// Builds a multiselect tile from its chip set. Open renders the listbox inline;
// the forced chip-hover accents are applied through a wrapping `sx`.
export function multiSelectNode(opts: {
  value: Option[];
  hover?: boolean;
  open?: boolean;
}): React.ReactElement {
  const field = (
    <UiMultiSelect
      options={ROLES}
      value={opts.value}
      label="Роль"
      placeholder="Почніть вводити"
      open={opts.open || undefined}
      disablePortal={opts.open || undefined}
    />
  );
  return opts.hover ? <Box sx={MS_CHIP_HOVER_SX}>{field}</Box> : field;
}

// The radio group has a single Figma state (one selected option). The Cyrillic
// label is held in a local so the JSX line stays within the byte-based
// max-line-length (each Cyrillic char is ~2 bytes).
export function radioNode(): React.ReactElement {
  const contactLabel = "Бажаний спосіб зв'язку";
  return <UiRadioGroup options={CONTACT} value="email" label={contactLabel} />;
}
