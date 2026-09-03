import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  objectControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { BackgroundOptionGroup, UiBackgroundPickerProps } from './types';

import UiBackgroundPicker from './index';

// The Figma "Название 1/2/3" thumbnails are themselves byte-identical across
// all three rows (a single placeholder board-preview bitmap), so one small
// inline SVG data URI stands in for the consumer's real board-preview art —
// no asset pipeline, no dependency on the shared showcase fixtures.
const THUMB_SRC: string =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'>" +
  "<rect width='32' height='32' fill='%23D0D4D8'/></svg>";

// The board's own two groups: unlabelled board previews, then the «Колір» swatches.
const GROUPS: BackgroundOptionGroup[] = [
  {
    options: [
      { id: 'name-1', label: 'Назва 1', kind: 'image', src: THUMB_SRC },
      { id: 'name-2', label: 'Назва 2', kind: 'image', src: THUMB_SRC },
      { id: 'name-3', label: 'Назва 3', kind: 'image', src: THUMB_SRC },
    ],
  },
  {
    heading: 'Колір',
    options: [
      { id: 'grey', label: 'Сірий', kind: 'color', color: '#E1E7EA' },
      { id: 'blue', label: 'Синій', kind: 'color', color: '#1EAEFF' },
      { id: 'dark', label: 'Темний', kind: 'color', color: '#1B2327' },
    ],
  },
];

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
  args: { groups: GROUPS },
  render: renderInteractive,
};

// Opened card: the SAME card grown downward — trigger row, divider, three
// board rows, a second divider, the «Колір» heading, three swatch rows.
export const Open: Story = {
  args: { groups: GROUPS, open: true },
  render: renderInteractive,
};
