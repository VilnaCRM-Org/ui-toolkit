import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  numberControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiPaginationProps } from './types';

import UiPagination from './index';

// The navigator is always controlled, so a stateful wrapper owns the current page
// and feeds it back through `onChange`, keeping the story interactive. Props are
// threaded explicitly (the repo forbids prop-spreading).
function PaginationStory({ args }: Readonly<{ args: UiPaginationProps }>): React.ReactElement {
  const [page, setPage] = React.useState<number>(args.value);
  // Adopt `value` changes from Storybook Controls while keeping clicks interactive.
  React.useEffect((): void => {
    setPage(args.value);
  }, [args.value]);
  return (
    <UiPagination
      value={page}
      count={args.count}
      disabled={args.disabled}
      siblingCount={args.siblingCount}
      boundaryCount={args.boundaryCount}
      previousLabel={args.previousLabel}
      nextLabel={args.nextLabel}
      onChange={setPage}
    />
  );
}

const meta: Meta<typeof UiPagination> = {
  title: 'UiComponents/UiPagination',
  component: UiPagination,
  tags: ['autodocs'],
  argTypes: {
    value: numberControlArgType('Current page (1-based)'),
    count: numberControlArgType('Total number of pages'),
    siblingCount: numberControlArgType('Pages shown on each side of the current page'),
    boundaryCount: numberControlArgType('Always-visible pages at each end'),
    disabled: booleanControlArgType('Whether the whole navigator is disabled'),
    previousLabel: textControlArgType('Label for the previous-page link'),
    nextLabel: textControlArgType('Label for the next-page link'),
  },
};

export default meta;

type Story = StoryObj<typeof UiPagination>;

function renderStory(args: UiPaginationProps): React.ReactElement {
  return <PaginationStory args={args} />;
}

export const Pagination: Story = {
  args: { value: 2, count: 7 },
  render: renderStory,
};

export const ManyPagesWithEllipsis: Story = {
  args: { value: 8, count: 20 },
  render: renderStory,
};

export const FirstPage: Story = {
  args: { value: 1, count: 10 },
  render: renderStory,
};

export const LastPage: Story = {
  args: { value: 10, count: 10 },
  render: renderStory,
};

export const Disabled: Story = {
  args: { value: 2, count: 7, disabled: true },
  render: renderStory,
};
