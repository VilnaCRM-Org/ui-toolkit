import { Box, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { fontFamilies } from '@/utils/font-tokens';

import { sharedPalette } from './index';

type PaletteName = keyof typeof sharedPalette;

const PALETTE_NAMES: PaletteName[] = Object.keys(sharedPalette) as PaletteName[];

function PaletteSwatch({ name }: Readonly<{ name: PaletteName }>): React.ReactElement {
  const { main } = sharedPalette[name];
  return (
    <Stack component="li" direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Box
        aria-hidden
        sx={{
          width: 48,
          height: 32,
          flexShrink: 0,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey400.main',
          backgroundColor: main,
        }}
      />
      <Typography component="code" sx={{ minWidth: 200, fontFamily: fontFamilies.inter }}>
        {name}
      </Typography>
      <Typography component="code" sx={{ fontFamily: fontFamilies.inter }}>
        {main}
      </Typography>
    </Stack>
  );
}

function renderSwatch(name: PaletteName): React.ReactElement {
  return <PaletteSwatch key={name} name={name} />;
}

function SharedPaletteList(): React.ReactElement {
  return (
    <Stack component="ul" spacing={1} aria-label="Shared palette" sx={{ listStyle: 'none', p: 0 }}>
      {PALETTE_NAMES.map(renderSwatch)}
    </Stack>
  );
}

const meta: Meta<typeof SharedPaletteList> = {
  title: 'UiComponents/UiColorTheme',
  component: SharedPaletteList,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ColorTheme: Story = {};
