import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { fontFamilies } from '@/utils/font-tokens';
import { cacheByTheme } from '@/utils/ui-theme';

import { OPEN_FIELD_POPPER, type ListboxSlotProps } from '../field-controls';

import type { UiSelectWithSearchProps } from './types';

type SlotStyle = SystemStyleObject<Theme>;

function popupIndicatorStyles(theme: Theme): SlotStyle {
  return { color: theme.palette.grey300.main, marginRight: '0.5rem' };
}

function clearIndicatorStyles(theme: Theme): SlotStyle {
  return { visibility: 'visible', color: theme.palette.grey300.main };
}

function paperStyles(theme: Theme): SlotStyle {
  return {
    borderRadius: 0,
    borderBottomLeftRadius: '0.5rem',
    borderBottomRightRadius: '0.5rem',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.grey400.main}`,
    borderTop: 'none',
    boxShadow: 'none',
    marginTop: 0,
  };
}

function optionStyles(theme: Theme): SlotStyle {
  const wash: string = theme.palette.grey500.main;
  return {
    minHeight: '2.75rem',
    paddingLeft: '1.25rem',
    fontFamily: fontFamilies.golos,
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: theme.palette.darkSecondary.main,
    '&.Mui-focused': { backgroundColor: wash },
    '&[aria-selected="true"]': { backgroundColor: wash },
    '&[aria-selected="true"].Mui-focused': { backgroundColor: wash },
  };
}

function listboxStyles(theme: Theme): SlotStyle {
  return { padding: 0, '& .MuiAutocomplete-option': optionStyles(theme) };
}

interface SelectSlotStyles {
  popupIndicator: SlotStyle;
  clearIndicator: SlotStyle;
  paper: SlotStyle;
  listbox: SlotStyle;
}

const selectSlotStyles: (theme: Theme) => SelectSlotStyles = cacheByTheme(
  (theme: Theme): SelectSlotStyles => ({
    popupIndicator: popupIndicatorStyles(theme),
    clearIndicator: clearIndicatorStyles(theme),
    paper: paperStyles(theme),
    listbox: listboxStyles(theme),
  })
);

export interface SelectSlotProps {
  listbox: ListboxSlotProps['listbox'] & { sx: SlotStyle };
  clearIndicator: { tabIndex: 0; sx: SlotStyle };
  popupIndicator: { sx: SlotStyle };
  paper: { sx: SlotStyle };
  popper?: typeof OPEN_FIELD_POPPER;
}

function styledSlotProps(theme: Theme, listbox: ListboxSlotProps['listbox']): SelectSlotProps {
  const styles: SelectSlotStyles = selectSlotStyles(theme);
  return {
    listbox: { ...listbox, sx: styles.listbox },
    clearIndicator: { tabIndex: 0, sx: styles.clearIndicator },
    popupIndicator: { sx: styles.popupIndicator },
    paper: { sx: styles.paper },
  };
}

export function selectSlotProps(
  theme: Theme,
  control: UiSelectWithSearchProps,
  field: { slotProps: ListboxSlotProps }
): SelectSlotProps {
  const base: SelectSlotProps = styledSlotProps(theme, field.slotProps.listbox);
  return control.open ? { ...base, popper: OPEN_FIELD_POPPER } : base;
}
