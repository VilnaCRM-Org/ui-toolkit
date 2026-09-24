import type { SxProps, Theme } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import UiSxAdapter from './index';

const panelSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  width: '15rem',
  p: 3,
  bgcolor: 'backgroundGrey100.main',
  border: 1,
  borderColor: 'brandGray.main',
  borderRadius: '1rem',
  typography: 'bodyText16',
};

interface PanelProps {
  inline: boolean;
  title: string;
  body: string;
}

function Panel({ inline, title, body }: Readonly<PanelProps>): React.ReactElement {
  return (
    <UiSxAdapter sx={panelSx} inline={inline}>
      {({ className, style }) => (
        <div className={className} style={style}>
          <strong>{title}</strong>
          <span>{body}</span>
        </div>
      )}
    </UiSxAdapter>
  );
}

function Comparison(): React.ReactElement {
  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '1.5rem' }}>
      <Panel inline={false} title="className" body="An Emotion class on a plain div." />
      <Panel inline title="style" body="An inline style on a plain div." />
    </div>
  );
}

const meta: Meta<typeof UiSxAdapter> = {
  title: 'UiComponents/UiSxAdapter',
  component: UiSxAdapter,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof UiSxAdapter>;

export const ClassNameAndInlineStyle: Story = {
  render: () => <Comparison />,
};
