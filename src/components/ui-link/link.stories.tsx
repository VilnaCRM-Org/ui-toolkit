import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';

import UiLink from './index';

const meta: Meta<typeof UiLink> = {
  title: 'UiComponents/UiLink',
  component: UiLink,
  tags: ['autodocs'],
  argTypes: {
    children: {
      type: 'string',
      description: 'Text for the link',
    },
    href: {
      type: 'string',
      description: 'Link URL',
    },
    disabled: {
      control: 'boolean',
      description:
        'Board A disabled state: brand-gray ink, `aria-disabled="true"`, out of the tab order',
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiLink>;

export const Link: Story = {
  args: {
    children: t('Link'),
    href: '/',
  },
};
