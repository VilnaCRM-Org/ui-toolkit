import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { CHIP_LABEL, CHIP_VALUE } from '@/showcase/new-components-board/fixtures';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiFilterChipProps } from './types';

import UiFilterChip from './index';

// The chip renders NO list semantics of its own (a11y contract: "the consumer owns
// any surrounding list structure, exactly as the consumer owns the radiogroup
// around UiIntegrationCard"), so the filter region and its heading live here in
// the story rather than inside the component.
const HEADING_ID: string = 'ui-filter-chip-story-heading';
const HEADING_TEXT: string = 'Активні фільтри';
// Split across two segments so no source line exceeds the 100-BYTE lint budget
// (the checker counts UTF-8 bytes, and Cyrillic costs two per character).
const REMOVED_TEXT: string = [
  'Фільтр видалено.',
  'Змініть будь-який контрол, щоб повернути його.',
].join(' ');

// The Figma sample string is Russian while the toolkit's built-in strings are
// Ukrainian, which is exactly the case the `lang` passthrough exists for
// (SC 3.1.2) — so the stories carry it rather than pretending the filter text is
// page language.
const SAMPLE_LANG: string = 'ru';

const REGION_SX: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.75rem',
};

const REMOVED_SX: SxProps<Theme> = { margin: 0, font: 'inherit' };

// Split out of the wrapper below so the wrapper stays one screenful of state
// wiring (the rca per-function budget), and so the empty state is a plain
// paragraph — never a live region, which the contract forbids in every state.
function RemovedNote(): React.ReactElement {
  return (
    <Box component="p" sx={REMOVED_SX}>
      {REMOVED_TEXT}
    </Box>
  );
}

interface ChipPresence {
  present: boolean;
  heading: React.RefObject<HTMLHeadingElement | null>;
  handleRemove: () => void;
}

/**
 * A chip's existence IS its state, so "controlled" here means the STORY owns
 * whether the chip is mounted and `onRemove` feeds that back — the component never
 * self-removes and never moves focus on the consumer's behalf. This hook is
 * therefore the smallest honest consumer: it takes focus to the filter-region
 * heading when the chip goes away, which is the binding consumer duty in
 * `types.ts` (otherwise focus would drop to `<body>`, SC 2.4.3). The effect adopts
 * Controls edits, so changing any knob brings the removed chip back.
 */
function useChipPresence(args: Readonly<UiFilterChipProps>): ChipPresence {
  const heading: React.RefObject<HTMLHeadingElement | null> = React.useRef(null);
  const [present, setPresent] = React.useState<boolean>(true);
  React.useEffect((): void => {
    setPresent(true);
  }, [args.label, args.filterValue, args.removeLabel, args.disabled, args.lang]);
  const handleRemove: () => void = React.useCallback((): void => {
    setPresent(false);
    heading.current?.focus();
  }, []);
  return { present, heading, handleRemove };
}

// Split out of the wrapper so each function stays inside the rca per-function
// halstead budget. Props are threaded one by one — the repo forbids spreading.
function ActiveChip({
  args,
  onRemove,
}: Readonly<{ args: UiFilterChipProps; onRemove: () => void }>): React.ReactElement {
  return (
    <UiFilterChip
      label={args.label}
      filterValue={args.filterValue}
      removeLabel={args.removeLabel}
      disabled={args.disabled}
      lang={args.lang}
      onRemove={onRemove}
    />
  );
}

function FilterChipStory({ args }: Readonly<{ args: UiFilterChipProps }>): React.ReactElement {
  const presence: ChipPresence = useChipPresence(args);
  return (
    <Box component="section" aria-labelledby={HEADING_ID} sx={REGION_SX}>
      <h3 id={HEADING_ID} ref={presence.heading} tabIndex={-1}>
        {HEADING_TEXT}
      </h3>
      {presence.present ? (
        <ActiveChip args={args} onRemove={presence.handleRemove} />
      ) : (
        <RemovedNote />
      )}
    </Box>
  );
}

const meta: Meta<typeof UiFilterChip> = {
  title: 'UiComponents/UiFilterChip',
  component: UiFilterChip,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Grey prefix segment — the first half of the accessible name'),
    filterValue: textControlArgType('Dark value segment — the second half of the name'),
    removeLabel: textControlArgType('Hidden suffix; defaults to ", видалити фільтр"'),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, removal no-ops'),
    lang: textControlArgType('Only when the filter text differs from the page language'),
  },
};

export default meta;

type Story = StoryObj<typeof UiFilterChip>;

// Wired render: `onRemove` turns the whole 30px pill into ONE native button
// (never a smaller nested ×), so hover, `:active`, the focus ring and Enter/Space
// are all live.
function renderWired(args: UiFilterChipProps): React.ReactElement {
  return <FilterChipStory args={args} />;
}

// Static render: no `onRemove`, so the chip is plain content — no role, no
// tabindex, no ARIA of any kind — over an identical content tree, with the ×
// still painted decoratively. `disabled` is withheld on purpose: the static branch
// deliberately does not paint state it cannot expose programmatically.
function renderStatic(args: UiFilterChipProps): React.ReactElement {
  return (
    <UiFilterChip
      label={args.label}
      filterValue={args.filterValue}
      removeLabel={args.removeLabel}
      lang={args.lang}
    />
  );
}

// The primary story: the wired rest state, pixel-for-pixel with the Figma "Tags"
// master (the sample string is the master's own, curly quotes included).
export const FilterChip: Story = {
  args: { label: CHIP_LABEL, filterValue: CHIP_VALUE, lang: SAMPLE_LANG },
  render: renderWired,
};

// The aria-disabled boundary: a real, focusable button whose hover and `:active`
// recipes are suppressed and whose removal no-ops. Figma ships a disabled column,
// so it IS painted — both segments and the glyph swap to grey, nothing is dimmed.
export const Disabled: Story = {
  args: { label: CHIP_LABEL, filterValue: CHIP_VALUE, lang: SAMPLE_LANG, disabled: true },
  render: renderWired,
};

export const Static: Story = {
  args: { label: CHIP_LABEL, filterValue: CHIP_VALUE, lang: SAMPLE_LANG },
  render: renderStatic,
};
