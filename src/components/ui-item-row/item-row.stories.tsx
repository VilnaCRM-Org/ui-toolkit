import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  selectControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { ItemRowMethod, UiItemRowProps } from './types';

import UiItemRow from './index';

const METHODS: ItemRowMethod[] = ['get', 'put', 'post', 'delete'];

// The row is an always-controlled APG disclosure, so a stateful wrapper owns the
// `expanded` flag and feeds the next state back through `onToggle`, keeping the
// story interactive. Storybook Controls drive the initial state (and every other
// prop); props are threaded explicitly, since the repo forbids prop-spreading.
function ItemRowStory({ args }: Readonly<{ args: UiItemRowProps }>): React.ReactElement {
  const [expanded, setExpanded] = React.useState<boolean>(args.expanded ?? false);
  // Adopt `expanded` changes from Controls while keeping clicks interactive.
  React.useEffect((): void => {
    setExpanded(args.expanded ?? false);
  }, [args.expanded]);
  const toggle = React.useCallback((): void => setExpanded((prev): boolean => !prev), []);
  return (
    <UiItemRow
      method={args.method}
      path={args.path}
      description={args.description}
      muted={args.muted}
      expanded={expanded}
      panelId={args.panelId}
      onToggle={toggle}
    />
  );
}

const meta: Meta<typeof UiItemRow> = {
  title: 'UiComponents/UiItemRow',
  component: UiItemRow,
  tags: ['autodocs'],
  argTypes: {
    method: selectControlArgType('HTTP method — badge label and colour recipe', METHODS),
    path: textControlArgType('Endpoint path shown after the badge'),
    description: textControlArgType('Optional short description after the path'),
    muted: booleanControlArgType('Grey/inactive status (aria-disabled on wired rows)'),
    expanded: booleanControlArgType('Initial disclosure state (chevron flip + accent)'),
    panelId: textControlArgType('id of the controlled panel (aria-controls while expanded)'),
  },
};

export default meta;

type Story = StoryObj<typeof UiItemRow>;

// Wired render: the interactive disclosure wrapper (Controls stay live).
function renderInteractive(args: UiItemRowProps): React.ReactElement {
  return <ItemRowStory args={args} />;
}

// Static render: no `onToggle`, so the row is non-interactive content (no button
// role, no aria-expanded) — the chevron still renders, decoratively.
function renderStatic(args: UiItemRowProps): React.ReactElement {
  return (
    <UiItemRow
      method={args.method}
      path={args.path}
      description={args.description}
      muted={args.muted}
    />
  );
}

// The primary interactive story: a wired GET row whose Controls actually work.
export const ItemRow: Story = {
  args: { method: 'get', path: '/put/{petID}/uploadImage', description: 'Uploads an image' },
  render: renderInteractive,
};

export const PutMethod: Story = {
  args: { method: 'put', path: '/pet', description: 'Update existing pet' },
  render: renderInteractive,
};

export const PostMethod: Story = {
  args: { method: 'post', path: '/put/{petID}', description: 'Update existing pet' },
  render: renderInteractive,
};

export const DeleteMethod: Story = {
  args: { method: 'delete', path: '/delete/{petID}', description: 'Deletes existing pet' },
  render: renderInteractive,
};

// Muted wired row: the aria-disabled boundary pattern — still a focusable button,
// but activation no-ops, so `onToggle` never fires.
export const Muted: Story = {
  args: {
    method: 'get',
    path: '/put/{petID}/uploadImage',
    description: 'Uploads an image',
    muted: true,
  },
  render: renderInteractive,
};

// Unwired row: static content, no disclosure semantics.
export const Static: Story = {
  args: { method: 'get', path: '/put/{petID}/uploadImage', description: 'Uploads an image' },
  render: renderStatic,
};

// Expanded wired row: chevron flips up and tints to the method accent. No
// `panelId` here — the disclosure panel content is out of scope for 3.1, so a
// demo idref would just dangle; `panelId` is still exercisable via Controls.
export const Expanded: Story = {
  args: {
    method: 'post',
    path: '/put/{petID}',
    description: 'Update existing pet',
    expanded: true,
  },
  render: renderInteractive,
};
