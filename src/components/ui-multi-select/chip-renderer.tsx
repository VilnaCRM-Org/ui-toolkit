import { Chip } from '@mui/material';
import type { AutocompleteRenderValueGetItemProps } from '@mui/material';
import React from 'react';

import { buildDeleteIcon } from './delete-icon';
import { chipSx } from './styles';
import type { UiMultiSelectOption } from './types';

type GetItemProps = AutocompleteRenderValueGetItemProps<true>;
export type ChipRenderer = (
  items: UiMultiSelectOption[],
  getItemProps: GetItemProps
) => React.ReactNode;

// Builds the MUI v9 `renderValue` callback that turns the selected options into
// removable chips. `getItemProps` carries MUI's per-chip wiring (roving
// `tabIndex=-1`, `data-item-index`, `onDelete`); its fully-typed fields are
// applied explicitly (not spread) to satisfy the no-prop-spreading rule. When the
// whole control is disabled the delete affordance is dropped so chips are
// read-only.
export function createChipRenderer(disabled: boolean): ChipRenderer {
  return function renderChips(items, getItemProps): React.ReactNode {
    return items.map((option, index) => {
      const item: ReturnType<GetItemProps> = getItemProps({ index });
      return (
        <Chip
          key={item.key}
          label={option.label}
          size="small"
          className={item.className}
          tabIndex={item.tabIndex}
          data-item-index={item['data-item-index']}
          disabled={disabled || item.disabled}
          onDelete={disabled ? undefined : item.onDelete}
          deleteIcon={buildDeleteIcon(option.label)}
          sx={chipSx}
        />
      );
    });
  };
}
