import { Box } from '@mui/material';
import React from 'react';

import {
  CHIP_CLASS,
  LABEL_CLASS,
  TITLE_CLASS,
  avatarSx,
  chipSx,
  labelSx,
  metaRowSx,
  textColumnSx,
  titleSx,
} from './styles';
import type { TaskCardAvatar } from './use-task-card';

// The visible content shared by both the wired (button) and static card shells —
// ONE DOM tree, identical reading order. Every part is a real text node, so the
// card's accessible name comes straight from the content
// ("{assignee} {title} {deadlineLabel} {deadline}") with no aria-label anywhere.

interface TaskAvatarProps {
  avatar: TaskCardAvatar;
}

// An informative image, never a CSS background: the assignee name IS the alt text.
// Sized in both attributes (so the box is reserved before the photo loads) and rem
// CSS (so it scales with the user's text size).
function TaskAvatar({ avatar }: Readonly<TaskAvatarProps>): React.ReactElement {
  return (
    <Box
      component="img"
      src={avatar.src}
      alt={avatar.alt}
      width={34}
      height={34}
      loading="lazy"
      decoding="async"
      draggable={false}
      sx={avatarSx}
    />
  );
}

interface TaskMetaProps {
  deadlineLabel: string;
  deadline: string;
}

// Label + deadline chip. The chip is a plain span with zero ARIA — it is never
// hoverable, focusable or announced on its own; it is part of the card's name.
function TaskMeta({ deadlineLabel, deadline }: Readonly<TaskMetaProps>): React.ReactElement {
  return (
    <Box component="span" sx={metaRowSx}>
      <Box component="span" className={LABEL_CLASS} sx={labelSx}>
        {deadlineLabel}
      </Box>
      <Box component="span" className={CHIP_CLASS} sx={chipSx}>
        {deadline}
      </Box>
    </Box>
  );
}

export interface TaskCardContentProps {
  title: string;
  deadlineLabel: string;
  deadline: string;
  avatar: TaskCardAvatar | null;
}

export function TaskCardContent({
  title,
  deadlineLabel,
  deadline,
  avatar,
}: Readonly<TaskCardContentProps>): React.ReactElement {
  return (
    <>
      {avatar ? <TaskAvatar avatar={avatar} /> : null}
      <Box component="span" sx={textColumnSx}>
        <Box component="span" className={TITLE_CLASS} sx={titleSx}>
          {title}
        </Box>
        <TaskMeta deadlineLabel={deadlineLabel} deadline={deadline} />
      </Box>
    </>
  );
}
