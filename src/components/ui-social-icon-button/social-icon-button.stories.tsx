import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  selectControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { SocialNetwork, UiSocialIconButtonProps } from './types';

import UiSocialIconButton from './index';

// The board order: instagram, github, facebook, linkedin (Board A row layout).
const NETWORKS: SocialNetwork[] = ['instagram', 'github', 'facebook', 'linkedin'];

// 8px gap, matching the Board A row's own `gap-[8px]` (extraction.md).
const ROW_SX: SxProps<Theme> = { display: 'flex', gap: '0.5rem' };

const meta: Meta<typeof UiSocialIconButton> = {
  title: 'UiComponents/UiSocialIconButton',
  component: UiSocialIconButton,
  tags: ['autodocs'],
  argTypes: {
    network: selectControlArgType('Brand mark painted, and its default accessible name', [
      ...NETWORKS,
    ]),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, activation no-ops'),
  },
};

export default meta;

type Story = StoryObj<typeof UiSocialIconButton>;

// The primary story: one chip, switchable by network and disabled state.
export const SocialIconButton: Story = {
  args: { network: 'instagram' },
};

// A row of all four chips, as the board composes them — the consumer's
// composition, not a variant of the component itself (the brief's own
// "ONE chip is the component; a row of four is the consumer's composition").
function renderRow(args: UiSocialIconButtonProps): React.ReactElement {
  return (
    <Box sx={ROW_SX}>
      {NETWORKS.map(
        (network: SocialNetwork): React.ReactElement => (
          <UiSocialIconButton key={network} network={network} disabled={args.disabled} />
        )
      )}
    </Box>
  );
}

export const Row: Story = {
  args: { network: 'instagram' },
  render: renderRow,
};
