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
// applied explicitly (not spread) to satisfy the no-prop-spreading rule. The chip
// root is the single named remove control; when the whole control is disabled the
// delete affordance is dropped so chips are read-only.
type OnDelete = ReturnType<GetItemProps>['onDelete'];
type OnKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => void;
type RemoveControl = {
  'aria-label': string | undefined;
  onClick: OnDelete | undefined;
  onDelete: OnDelete | undefined;
  onKeyDown: OnKeyDown | undefined;
};

const NO_REMOVE_CONTROL: RemoveControl = {
  'aria-label': undefined,
  onClick: undefined,
  onDelete: undefined,
  onKeyDown: undefined,
};

function removeOnSpace(onDelete: OnDelete): OnKeyDown {
  return (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === ' ') onDelete(event);
  };
}

function removeControl(
  label: string,
  item: ReturnType<GetItemProps>,
  disabled: boolean
): RemoveControl {
  if (disabled) return NO_REMOVE_CONTROL;
  return {
    'aria-label': `Remove ${label}`,
    onClick: item.onDelete,
    onDelete: item.onDelete,
    onKeyDown: removeOnSpace(item.onDelete),
  };
}

export function createChipRenderer(disabled: boolean): ChipRenderer {
  return function renderChips(items, getItemProps): React.ReactNode {
    return items.map((option, index) => {
      const item: ReturnType<GetItemProps> = getItemProps({ index });
      const remove: RemoveControl = removeControl(option.label, item, disabled);
      return (
        <Chip
          key={item.key}
          label={option.label}
          size="small"
          className={item.className}
          tabIndex={item.tabIndex}
          data-item-index={item['data-item-index']}
          disabled={disabled || item.disabled}
          clickable={false}
          aria-label={remove['aria-label']}
          onClick={remove.onClick}
          onDelete={remove.onDelete}
          onKeyDown={remove.onKeyDown}
          deleteIcon={buildDeleteIcon()}
          sx={chipSx}
        />
      );
    });
  };
}
