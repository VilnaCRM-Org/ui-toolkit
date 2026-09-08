import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { PICKER_GROUPS } from '@/showcase/new-components-board/followup-fixtures';

import {
  booleanControlArgType,
  objectControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiBackgroundPickerProps } from './types';

import UiBackgroundPicker from './index';

interface StoryPickerState {
  open: boolean;
  value: string;
  handleOpenChange: (next: boolean) => void;
  handleChange: (id: string) => void;
}

/**
 * `open` and `value` are always controlled — the consumer owns both — so this
 * hook holds them and feeds the next ones back through
 * `onOpenChange`/`onChange`, keeping the story interactive. Storybook Controls
 * drive the initial state.
 */
function useStoryPickerState(args: Readonly<UiBackgroundPickerProps>): StoryPickerState {
  const [open, setOpen] = React.useState<boolean>(args.open ?? false);
  const [value, setValue] = React.useState<string>(args.value ?? '');
  React.useEffect((): void => setOpen(args.open ?? false), [args.open]);
  React.useEffect((): void => setValue(args.value ?? ''), [args.value]);
  const handleOpenChange = React.useCallback((next: boolean): void => setOpen(next), []);
  const handleChange = React.useCallback((id: string): void => setValue(id), []);
  return { open, value, handleOpenChange, handleChange };
}

// Props are threaded explicitly (the repo forbids prop-spreading).
function BackgroundPickerStory({
  args,
}: Readonly<{ args: UiBackgroundPickerProps }>): React.ReactElement {
  const state: StoryPickerState = useStoryPickerState(args);
  return (
    <UiBackgroundPicker
      groups={args.groups}
      label={args.label}
      value={state.value}
      onChange={state.handleChange}
      open={state.open}
      onOpenChange={state.handleOpenChange}
      disabled={args.disabled}
    />
  );
}

const meta: Meta<typeof UiBackgroundPicker> = {
  title: 'UiComponents/UiBackgroundPicker',
  component: UiBackgroundPicker,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Trigger text — constant across every row selection'),
    groups: objectControlArgType('Rows, grouped: [{ heading?, options: [...] }]'),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, every open no-ops'),
  },
};

export default meta;

type Story = StoryObj<typeof UiBackgroundPicker>;

function renderInteractive(args: UiBackgroundPickerProps): React.ReactElement {
  return <BackgroundPickerStory args={args} />;
}

// The primary story: the wired, closed, rest state, with the board's own two
// groups wired up.
export const BackgroundPicker: Story = {
  args: { groups: PICKER_GROUPS },
  render: renderInteractive,
};

// Opened card: the SAME card grown downward — trigger row, divider, three
// board rows, a second divider, the «Колір» heading, three swatch rows.
export const Open: Story = {
  args: { groups: PICKER_GROUPS, open: true },
  render: renderInteractive,
};
