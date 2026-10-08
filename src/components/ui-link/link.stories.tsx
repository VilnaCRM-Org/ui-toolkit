import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';
import { expect, userEvent, within } from 'storybook/test';

import UiLink from './index';

const externalLinkText: string = t('Read the docs');
const newTabHint: string = '(opens in new tab)';
const forgotPasswordText: string = t('Forgot password?');

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
    newTabLabel: {
      control: 'text',
      description: 'Required with target="_blank": the application\'s translated new-tab cue',
    },
    appearance: {
      control: 'inline-radio',
      options: ['default', 'text'],
      description:
        '`text` = Figma sign-in text link: Golos 500 15/18, 600 18/normal md-xl, no underline',
    },
    tone: {
      control: 'inline-radio',
      options: ['brand', 'accessible', 'inherit'],
      description: '`brand` = #1EAEFF (2.46:1 on white); `accessible` = #0074B5 (5.04:1)',
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

export const TextLink: Story = {
  args: {
    children: forgotPasswordText,
    href: '/',
    appearance: 'text',
  },
};

export const TextLinkRestsWithoutUnderline: Story = {
  tags: ['interaction', '!autodocs'],
  args: {
    children: forgotPasswordText,
    href: '/',
    appearance: 'text',
  },
  play: async ({ canvasElement }): Promise<void> => {
    const link: HTMLElement = within(canvasElement).getByRole('link', { name: forgotPasswordText });

    await expect(getComputedStyle(link).color).toBe('rgb(30, 174, 255)');
    await expect(getComputedStyle(link).textDecorationLine).toBe('none');

    await userEvent.tab();

    await expect(link).toHaveFocus();
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
    newTabLabel: newTabHint,
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
