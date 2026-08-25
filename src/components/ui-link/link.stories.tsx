import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';
import { expect, userEvent, within } from 'storybook/test';

import UiLink from './index';

const externalLinkText: string = t('Read the docs');
const newTabHint: string = '(opens in new tab)';

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

// Interaction story (`interaction` tag): proves the link is keyboard reachable and
// that a `target="_blank"` link folds the new-tab hint into its accessible name
// while forcing `rel="noopener noreferrer"`. See tests/storybook/README.md.
export const KeyboardFocusExposesNewTabHint: Story = {
  tags: ['interaction', '!autodocs'],
  args: {
    children: externalLinkText,
    href: 'https://vilnacrm.com',
    target: '_blank',
  },
  play: async ({ canvasElement }): Promise<void> => {
    const link: HTMLElement = within(canvasElement).getByRole('link', {
      name: `${externalLinkText} ${newTabHint}`,
    });

    await userEvent.tab();

    await expect(link).toHaveFocus();
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};
