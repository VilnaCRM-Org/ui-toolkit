import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { TASK_AVATAR_SRC } from '@/showcase/new-components-board/fixtures';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { TaskAssignee, UiTaskCardProps } from './types';

import UiTaskCard from './index';

// The canonical sample content of the Figma master, so every story reads as the
// design does. The avatar is the master's own photo, shared with the showcase
// board (one inlined copy of the data URI for both surfaces).
const ASSIGNEE: TaskAssignee = {
  name: 'Евгения Маслова',
  avatarSrc: TASK_AVATAR_SRC,
};
const TITLE: string = 'Подготовить бриф для заказчика @zakazchik';
const LONG_TITLE: string =
  'Подготовить бриф для заказчика @zakazchik ' +
  'и согласовать смету с финансовым отделом ' +
  'до конца недели';

// Activation is fire-and-forget, and the stories demonstrate the card rather than
// a board, so the wired stories share this stable no-op handler.
function noopActivate(): void {}

const meta: Meta<typeof UiTaskCard> = {
  title: 'UiComponents/UiTaskCard',
  component: UiTaskCard,
  tags: ['autodocs'],
  argTypes: {
    title: textControlArgType('Task title — wraps naturally, never clamped'),
    deadlineLabel: textControlArgType('Visible label in front of the deadline chip'),
    deadline: textControlArgType('Deadline chip text (non-interactive)'),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, activation no-ops'),
  },
};

export default meta;

type Story = StoryObj<typeof UiTaskCard>;

// Wired render: `onActivate` makes the whole card one native button, so hover and
// the focus ring are live (Controls stay wired to the remaining props).
function renderWired(args: UiTaskCardProps): React.ReactElement {
  return (
    <UiTaskCard
      title={args.title}
      deadlineLabel={args.deadlineLabel}
      deadline={args.deadline}
      assignee={args.assignee}
      disabled={args.disabled}
      onActivate={noopActivate}
    />
  );
}

// Static render: no `onActivate`, so the card is plain content — no button role,
// no tabindex, no aria-disabled — over an identical content tree.
function renderStatic(args: UiTaskCardProps): React.ReactElement {
  return (
    <UiTaskCard
      title={args.title}
      deadlineLabel={args.deadlineLabel}
      deadline={args.deadline}
      assignee={args.assignee}
    />
  );
}

// The primary story: the wired rest state, pixel-for-pixel with the Figma master.
export const TaskCard: Story = {
  args: {
    title: TITLE,
    deadlineLabel: 'Дедлайн',
    deadline: '12.09 15:00',
    assignee: ASSIGNEE,
  },
  render: renderWired,
};

// Disabled wired card: the aria-disabled boundary — a real, focusable button whose
// hover recipe is suppressed and whose activation no-ops (Figma draws no disabled
// state, so it ships as semantics only).
export const Disabled: Story = {
  args: {
    title: TITLE,
    deadlineLabel: 'Дедлайн',
    deadline: '12.09 15:00',
    assignee: ASSIGNEE,
    disabled: true,
  },
  render: renderWired,
};

export const Static: Story = {
  args: {
    title: TITLE,
    deadlineLabel: 'Дедлайн',
    deadline: '12.09 15:00',
    assignee: ASSIGNEE,
  },
  render: renderStatic,
};

// Unassigned task: no photo is painted, but the 34px avatar track stays reserved,
// so titles left-align with the assigned cards above and below it in a column.
export const Unassigned: Story = {
  args: { title: TITLE, deadlineLabel: 'Дедлайн', deadline: '12.09 15:00' },
  render: renderWired,
};

// Wrap proof: the title runs past two lines, the card grows with it (minHeight,
// never height) and the unbroken `@mention` token breaks instead of overflowing.
export const LongTitle: Story = {
  args: {
    title: LONG_TITLE,
    deadlineLabel: 'Дедлайн',
    deadline: '12.09 15:00',
    assignee: ASSIGNEE,
  },
  render: renderWired,
};
