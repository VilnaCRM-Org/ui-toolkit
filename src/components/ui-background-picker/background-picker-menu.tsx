import { Box } from '@mui/material';
import React from 'react';

import {
  colorMediaSx,
  dividerSx,
  headingSx,
  imageMediaSx,
  menuSx,
  rowSx,
  sectionSx,
} from './menu-styles';
import type { BackgroundOption, BackgroundOptionGroup } from './types';
import type { BackgroundPickerModel } from './use-background-picker';
import { useMenuActionHandlers } from './use-menu-handlers';

// `kind` selects which of `src`/`color` is painted — the unused field is
// simply ignored, so a consumer never has to null it out.
function OptionMedia({ option }: Readonly<{ option: BackgroundOption }>): React.ReactElement {
  if (option.kind === 'image') {
    return <Box component="img" src={option.src} alt="" width={32} height={32} sx={imageMediaSx} />;
  }
  return <Box component="span" aria-hidden="true" sx={colorMediaSx(option.color)} />;
}

export interface BackgroundPickerRowProps {
  option: BackgroundOption;
  checked: boolean;
  onActivate: (id: string) => void;
}

// One row: a native `role="menuitemradio"` button, `tabIndex={-1}` because the
// menu contributes zero tab stops (rows are found by role, never a roving
// tabindex). The visible label IS the accessible name. `checked` drives
// `aria-checked` only: the selected fill is a CSS rule keyed off that attribute
// (see `rowSx`), so the state is published once and painted from it.
function BackgroundPickerRow({
  option,
  checked,
  onActivate,
}: Readonly<BackgroundPickerRowProps>): React.ReactElement {
  const optionId: string = option.id;
  const activate: () => void = React.useCallback(
    (): void => onActivate(optionId),
    [optionId, onActivate]
  );
  return (
    <Box
      component="button"
      type="button"
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={-1}
      onClick={activate}
      sx={rowSx}
    >
      <OptionMedia option={option} />
      {option.label}
    </Box>
  );
}

export interface GroupSectionProps {
  group: BackgroundOptionGroup;
  headingId: string;
  value: string;
  onActivate: (id: string) => void;
}

function GroupRows({
  group,
  value,
  onActivate,
}: Readonly<Omit<GroupSectionProps, 'headingId'>>): React.ReactElement {
  return (
    <>
      {group.options.map((option: BackgroundOption) => (
        <BackgroundPickerRow
          key={option.id}
          option={option}
          checked={option.id === value}
          onActivate={onActivate}
        />
      ))}
    </>
  );
}

// A headed group wraps its rows in `role="group"` whose first child is the
// visible heading; a headless group renders its rows directly (no wrapper).
function GroupSection({
  group,
  headingId,
  value,
  onActivate,
}: Readonly<GroupSectionProps>): React.ReactElement {
  if (group.heading == null) {
    return (
      <Box component="div" sx={sectionSx}>
        <GroupRows group={group} value={value} onActivate={onActivate} />
      </Box>
    );
  }
  return (
    <Box component="div" role="group" aria-labelledby={headingId} sx={sectionSx}>
      <Box component="div" id={headingId} sx={headingSx}>
        {group.heading}
      </Box>
      <GroupRows group={group} value={value} onActivate={onActivate} />
    </Box>
  );
}

export interface BackgroundPickerMenuProps {
  model: BackgroundPickerModel;
}

/**
 * The open surface: a full-bleed divider precedes EVERY group (including the
 * first, right after the trigger row), so the anatomy generalises to any
 * number of groups. It renders IN PLACE — no portal, no `maxHeight`, no
 * scrolling — because the whole card grows downward.
 */
export function BackgroundPickerMenu({
  model,
}: Readonly<BackgroundPickerMenuProps>): React.ReactElement {
  const handlers = useMenuActionHandlers(model.ctx);
  return (
    <Box
      role="menu"
      id={model.menuId}
      aria-labelledby={model.triggerId}
      ref={model.ctx.refs.menu}
      onKeyDown={handlers.onKeyDown}
      sx={menuSx}
    >
      {model.groups.map((group: BackgroundOptionGroup, index: number) => (
        <React.Fragment key={group.heading ?? index}>
          <Box component="hr" sx={dividerSx} />
          <GroupSection
            group={group}
            headingId={`${model.menuId}-heading-${index}`}
            value={model.value}
            onActivate={handlers.onRowActivate}
          />
        </React.Fragment>
      ))}
    </Box>
  );
}
