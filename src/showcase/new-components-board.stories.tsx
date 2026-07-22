import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  UiCalendarMultiSelect,
  UiFileUploadInput,
  UiMultiSelect,
  UiRadioGroup,
  UiSearchInput,
  UiSelectWithSearch,
} from '@/components';
import { crmBreakpointValues } from '@/components/ui-breakpoints';

const MOBILE_MAX = `@media (max-width: ${crmBreakpointValues.sm}px)` as const;

// A "board" that lays every new Epic-2 control (the ones CRM/website lack) out at
// its exact Figma component width, in every state Figma draws. Prop-driven states
// (rest/filled/empty/selected/disabled/error) render directly; interaction states
// Figma draws as separate frames (hover, open dropdown) are forced on statically —
// hover via a wrapper that re-applies the theme's hover visuals, open via the
// `open`/`disablePortal` props so the real dropdown renders inline. Ukrainian copy
// mirrors the Figma frames. Everything is fluid below 480px (mobile).
const CITIES = [
  { label: 'Київ', value: 'kyiv' },
  { label: 'Львів', value: 'lviv' },
  { label: 'Одеса', value: 'odesa' },
  { label: 'Харків', value: 'kharkiv' },
];
const ROLES = [
  { label: 'UX designer', value: 'ux' },
  { label: 'Розробник', value: 'dev' },
  { label: 'Дизайнер', value: 'design' },
  { label: 'Менеджер', value: 'manager' },
];
const PICKED = [ROLES[0], ROLES[2]];
// Three chips wrap onto two rows (the chevron + clear-X reserve the right edge).
const PICKED3 = [ROLES[0], ROLES[1], ROLES[2]];
const CONTACT = [
  { label: 'Електронна пошта', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Сповіщення', value: 'push' },
];
const SUGGESTIONS = ['Топ продажники', 'Топ продажі за місяць', 'Топ продажі за рік'];
// Calendar showcase states, all on August 2022 — it starts on a Monday and has 31
// days, so its last row reads 29 30 31 1 2 3 4 (matching the Figma frame). Rest: a
// single selected day. Active: a clean in-month range (1–5) so both endpoints show.
// Active (other month): a range that starts in-month and runs past its end, so the
// next month's leading days fall in range.
const CAL_MONTH = '2022-08-01';
const CAL_REST = ['2022-08-01'];
const CAL_ACTIVE = ['2022-08-01', '2022-08-05'];
const CAL_ACTIVE_OTHER = ['2022-08-01', '2022-09-10'];

// Forced interaction-state visuals (Figma draws these as separate frames). Each
// re-applies the exact hover recipe the theme scopes to `:hover`.
const SEARCH_HOVER_SX = {
  '& .MuiInputAdornment-positionStart': { color: '#1EAEFF' },
  '& .MuiOutlinedInput-root': { boxShadow: '0px 4px 9px 0px rgba(74, 78, 95, 0.1)' },
} as const;
// Forced responsive variant: the field's tablet sizing is viewport-media-gated, so a
// wide-viewport showcase tile re-applies it directly — 52px tall, 24px magnifier, 16px
// text. (Mobile matches desktop except width, so its tile only overrides the width.)
const SEARCH_TABLET_SX = {
  '& .MuiOutlinedInput-root': { height: '3.25rem', minHeight: '3.25rem', fontSize: '1rem' },
  '& .MuiInputAdornment-positionStart svg': { width: '1.5rem', height: '1.5rem' },
  // The dropdown's tablet sizing is media-gated too: 7px visible gap, 62px rows,
  // 16px text, 22px inset (Figma node 439:19410).
  '& .MuiAutocomplete-paper': { marginTop: '0.4375rem' },
  '& .MuiAutocomplete-listbox .MuiAutocomplete-option': {
    minHeight: '3.875rem',
    fontSize: '1rem',
    paddingLeft: '1.375rem',
  },
} as const;
// Active/open state: Figma tints the magnifier brand-blue (the focus/hover accent).
const SEARCH_ACTIVE_SX = { '& .MuiInputAdornment-positionStart': { color: '#1EAEFF' } } as const;
// The paper's field-width collapse and 8px gap are media-gated (mobile), so a forced-
// mobile open tile re-zeros the min-width and re-applies the gap.
const SEARCH_MOBILE_PAPER_SX = {
  '& .MuiAutocomplete-paper': { minWidth: 0, marginTop: '0.375rem' },
} as const;
const SELECT_HOVER_SX = {
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D0D4D8' },
} as const;
const UPLOAD_HOVER_SX = {
  '& .ui-file-upload-pill': { backgroundColor: '#00A3FF' },
  // Hover also darkens the field stroke grey400 -> grey300 (the theme's `:hover`
  // recipe), which a statically-forced tile must re-apply itself.
  '& .ui-file-upload-dropzone': { borderColor: '#969B9D' },
} as const;
// Forced chip-hover: a 1px brand-blue border + the × filled into a blue circle with
// a white glyph (Figma node 622:44563).
const MS_CHIP_HOVER_SX = {
  '& .MuiChip-root': { borderColor: '#1EAEFF' },
  '& .ui-chip-x': { backgroundColor: '#1EAEFF', color: '#FFFFFF' },
} as const;
// Forced day-hover: the theme scopes the light-blue disc to `:hover`, so a static
// tile re-applies it to one day (the 5th, found by its accessible-name prefix).
const CAL_HOVER_SX = {
  '& [aria-label^="5 "] .ui-day-circle': { backgroundColor: 'rgba(30, 174, 255, 0.1)' },
} as const;

interface StateSpec {
  label: string;
  node: React.ReactNode;
  /** Open/dropdown tiles need vertical room for the inline popper. */
  tall?: boolean;
  /** Overrides the group width, for responsive-variant tiles (tablet/mobile). */
  width?: number;
}
interface GroupSpec {
  title: string;
  /** The Figma component width, in px, so each tile matches the design 1:1. */
  width: number;
  states: StateSpec[];
}

// Builds a search-field tile for a size/state combination. Responsive sizing is
// viewport-gated and hover/open visuals are pointer-gated, so each is forced here.
function searchNode(opts: {
  tablet?: boolean;
  hover?: boolean;
  open?: boolean;
  mobilePaper?: boolean;
}): React.ReactElement {
  const sx: SxProps<Theme> = [
    ...(opts.tablet ? [SEARCH_TABLET_SX] : []),
    ...(opts.hover ? [SEARCH_HOVER_SX] : []),
    ...(opts.open ? [SEARCH_ACTIVE_SX] : []),
    ...(opts.mobilePaper ? [SEARCH_MOBILE_PAPER_SX] : []),
  ];
  return (
    <Box sx={sx}>
      <UiSearchInput
        aria-label="Пошук"
        placeholder="Щось шукаєте?"
        options={SUGGESTIONS}
        value={opts.open ? 'Топ прод' : undefined}
        open={opts.open || undefined}
        disablePortal={opts.open || undefined}
      />
    </Box>
  );
}

const GROUPS: GroupSpec[] = [
  {
    title: 'Пошук',
    width: 477,
    states: [
      { label: 'Rest', node: searchNode({}) },
      { label: 'Hover', node: searchNode({ hover: true }) },
      { label: 'Open', tall: true, node: searchNode({ open: true }) },
      { label: 'Tablet — Rest', width: 360, node: searchNode({ tablet: true }) },
      { label: 'Tablet — Hover', width: 360, node: searchNode({ tablet: true, hover: true }) },
      {
        label: 'Tablet — Open',
        width: 360,
        tall: true,
        node: searchNode({ tablet: true, open: true }),
      },
      { label: 'Mobile — Rest', width: 355, node: searchNode({}) },
      { label: 'Mobile — Hover', width: 355, node: searchNode({ hover: true }) },
      {
        label: 'Mobile — Open',
        width: 355,
        tall: true,
        node: searchNode({ open: true, mobilePaper: true }),
      },
    ],
  },
  {
    title: 'Select з пошуком',
    width: 262,
    states: [
      {
        label: 'Rest',
        node: (
          <UiSelectWithSearch options={CITIES} aria-label="Місто" placeholder="Оберіть місто" />
        ),
      },
      {
        label: 'Hover',
        node: (
          <Box sx={SELECT_HOVER_SX}>
            <UiSelectWithSearch options={CITIES} aria-label="Місто" placeholder="Оберіть місто" />
          </Box>
        ),
      },
      {
        label: 'Open',
        tall: true,
        node: (
          <UiSelectWithSearch
            options={CITIES}
            aria-label="Місто"
            placeholder="Оберіть місто"
            open
            disablePortal
          />
        ),
      },
    ],
  },
  {
    title: 'Multiselect',
    width: 430,
    states: [
      {
        label: 'Filled',
        node: (
          <UiMultiSelect
            options={ROLES}
            value={PICKED}
            label="Роль"
            placeholder="Почніть вводити"
          />
        ),
      },
      {
        label: 'Filled ×3',
        node: (
          <UiMultiSelect
            options={ROLES}
            value={PICKED3}
            label="Роль"
            placeholder="Почніть вводити"
          />
        ),
      },
      {
        label: 'Item hover',
        node: (
          <Box sx={MS_CHIP_HOVER_SX}>
            <UiMultiSelect
              options={ROLES}
              value={PICKED}
              label="Роль"
              placeholder="Почніть вводити"
            />
          </Box>
        ),
      },
      {
        label: 'Empty',
        node: (
          <UiMultiSelect options={ROLES} value={[]} label="Роль" placeholder="Почніть вводити" />
        ),
      },
      {
        label: 'Open',
        tall: true,
        node: (
          <UiMultiSelect
            options={ROLES}
            value={PICKED}
            label="Роль"
            placeholder="Почніть вводити"
            open
            disablePortal
          />
        ),
      },
    ],
  },
  {
    title: 'Radio button',
    width: 262,
    states: [
      {
        label: 'Selected',
        node: <UiRadioGroup options={CONTACT} value="email" label="Бажаний спосіб зв'язку" />,
      },
    ],
  },
  {
    title: 'Календар (діапазон дат)',
    width: 320,
    states: [
      {
        label: 'Rest',
        node: (
          <UiCalendarMultiSelect
            label="Доступні дати"
            defaultMonth={CAL_MONTH}
            locale="uk-UA"
            value={CAL_REST}
          />
        ),
      },
      {
        label: 'Hover',
        node: (
          <Box sx={CAL_HOVER_SX}>
            <UiCalendarMultiSelect
              label="Доступні дати"
              defaultMonth={CAL_MONTH}
              locale="uk-UA"
              value={CAL_REST}
            />
          </Box>
        ),
      },
      {
        label: 'Active',
        node: (
          <UiCalendarMultiSelect
            label="Доступні дати"
            defaultMonth={CAL_MONTH}
            locale="uk-UA"
            value={CAL_ACTIVE}
          />
        ),
      },
      {
        label: 'Active (other month)',
        node: (
          <UiCalendarMultiSelect
            label="Доступні дати"
            defaultMonth={CAL_MONTH}
            locale="uk-UA"
            value={CAL_ACTIVE_OTHER}
          />
        ),
      },
    ],
  },
  {
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
      {
        label: 'Hover',
        node: (
          <Box sx={UPLOAD_HOVER_SX}>
            <UiFileUploadInput
              files={[]}
              label="Логотип проєкту"
              buttonLabel="Загрузити"
              accept=".png,.jpg"
            />
          </Box>
        ),
      },
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
  },
];

const pageSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3rem',
  padding: '2.5rem',
  [MOBILE_MAX]: { padding: '1rem', gap: '2rem' },
  backgroundColor: '#FBFBFB',
  fontFamily: 'Inter',
} as const;
const groupTitleSx = {
  fontFamily: 'Inter',
  fontWeight: 600,
  fontSize: '1rem',
  color: '#1A1C1E',
  marginBottom: '1.25rem',
} as const;
const rowSx = { display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' } as const;
const itemBaseSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
} as const;
const tallSx = { position: 'relative', minHeight: '340px' } as const;
const stateLabelSx = {
  fontFamily: 'Inter',
  fontWeight: 600,
  fontSize: '0.6875rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#969B9D',
} as const;

function StateItem({
  label,
  width,
  tall,
  children,
}: Readonly<{
  label: string;
  width: number;
  tall?: boolean;
  children: React.ReactNode;
}>): React.ReactElement {
  const sizing = { width: `${width}px`, maxWidth: '100%', boxSizing: 'border-box' } as const;
  return (
    <Box sx={{ ...itemBaseSx, ...sizing, ...(tall ? tallSx : {}) }}>
      <Typography component="span" sx={stateLabelSx}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function Group({ title, width, states }: Readonly<GroupSpec>): React.ReactElement {
  return (
    <Box component="section">
      <Typography component="h3" sx={groupTitleSx}>
        {title}
      </Typography>
      <Box sx={rowSx}>
        {states.map(state => (
          <StateItem
            key={state.label}
            label={state.label}
            width={state.width ?? width}
            tall={state.tall}
          >
            {state.node}
          </StateItem>
        ))}
      </Box>
    </Box>
  );
}

function Board(): React.ReactElement {
  return (
    <Box sx={pageSx}>
      {GROUPS.map(group => (
        <Group key={group.title} title={group.title} width={group.width} states={group.states} />
      ))}
    </Box>
  );
}

const meta: Meta<typeof Board> = {
  title: 'Showcase/New Components (Figma parity)',
  component: Board,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof Board>;

export const FigmaParity: Story = {};
