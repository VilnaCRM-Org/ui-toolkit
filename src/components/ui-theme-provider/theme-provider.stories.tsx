import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';
import React from 'react';

import UiButton from '../ui-button';
import UiInput from '../ui-input';

import type { UiThemeProviderProps } from './types';

import UiThemeProvider from './index';

const buttonLabel: string = t('header.actions.try_it_out');
const inputLabel: string = t('Full name');

const consumerOverride: NonNullable<UiThemeProviderProps['theme']> = {
  palette: {
    primary: { main: '#6B4EFF' },
    grey400: { main: '#6B4EFF' },
  },
} as NonNullable<UiThemeProviderProps['theme']>;

const columnSx = { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '20rem' };

function Controls(): React.ReactElement {
  return (
    <Box sx={columnSx}>
      <UiButton variant="contained" size="small">
        {buttonLabel}
      </UiButton>
      <UiInput label={inputLabel} placeholder={inputLabel} />
    </Box>
  );
}

function Comparison(): React.ReactElement {
  return (
    <Box sx={{ display: 'flex', gap: '3rem', padding: '1.5rem' }}>
      <UiThemeProvider>
        <Controls />
      </UiThemeProvider>
      <UiThemeProvider theme={consumerOverride}>
        <Controls />
      </UiThemeProvider>
    </Box>
  );
}

const meta: Meta<typeof UiThemeProvider> = {
  title: 'UiComponents/UiThemeProvider',
  component: UiThemeProvider,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof UiThemeProvider>;

export const ConsumerPaletteOverride: Story = {
  render: () => <Comparison />,
};
