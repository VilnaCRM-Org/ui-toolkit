import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { textControlArgType } from '../../../.storybook/field-story-arg-types';
import UiItemRow from '../ui-item-row';
import type { ItemRowMethod } from '../ui-item-row/types';

import type { UiItemsListProps } from './types';

import UiItemsList from './index';

// The Figma "Rest api dropdown" sample rows (literal strings, typos included, for
// parity). Each row is an independently-controlled disclosure; the list itself
// stays dumb (it only stacks its children).
interface SampleRow {
  method: ItemRowMethod;
  path: string;
  description: string;
}

const SAMPLE_ROWS: SampleRow[] = [
  { method: 'get', path: '/put/{petID}/uploadImage', description: 'Uploads an image' },
  { method: 'put', path: '/pet', description: 'Update exiting pet' },
  { method: 'post', path: '/put/{petID}', description: 'Update exiting pet' },
  { method: 'delete', path: '/delete/{petID}', description: 'Deletes exiting pet' },
];

function rowKey(row: SampleRow): string {
  return `${row.method} ${row.path}`;
}

// A single-open accordion over the sample rows: each row owns its `expanded` via
// the shared open-key, and toggling one collapses the rest. Props are threaded
// explicitly (the repo forbids prop-spreading).
function ItemsListStory({ args }: Readonly<{ args: UiItemsListProps }>): React.ReactElement {
  const [openKey, setOpenKey] = React.useState<string | null>(null);
  return (
    <UiItemsList aria-label={args['aria-label']}>
      {SAMPLE_ROWS.map((row): React.ReactElement => {
        const key: string = rowKey(row);
        return (
          <UiItemRow
            key={key}
            method={row.method}
            path={row.path}
            description={row.description}
            expanded={openKey === key}
            onToggle={(): void => setOpenKey((prev): string | null => (prev === key ? null : key))}
          />
        );
      })}
    </UiItemsList>
  );
}

const meta: Meta<typeof UiItemsList> = {
  title: 'UiComponents/UiItemsList',
  component: UiItemsList,
  tags: ['autodocs'],
  argTypes: {
    'aria-label': textControlArgType('Optional accessible name for the list'),
  },
};

export default meta;

type Story = StoryObj<typeof UiItemsList>;

function renderStory(args: UiItemsListProps): React.ReactElement {
  return <ItemsListStory args={args} />;
}

// The composed list of the four Figma sample endpoints, stacked 8px apart.
export const ItemsList: Story = {
  args: { 'aria-label': 'Pet store endpoints' },
  render: renderStory,
};
