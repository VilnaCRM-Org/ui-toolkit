import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import UiButton from '../ui-button';
import UiContainer from '../ui-container';
import UiTypography from '../ui-typography';

import Layout from './index';

const meta: Meta<typeof Layout> = {
  title: 'UiComponents/Layout',
  component: Layout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof Layout>;

function DemoHeader(): React.ReactElement {
  return (
    <header>
      <UiContainer>
        <UiTypography variant="h2" component="h1">
          Vilna Toolkit
        </UiTypography>
      </UiContainer>
    </header>
  );
}

function DemoFooter(): React.ReactElement {
  return (
    <footer>
      <UiContainer>
        <UiTypography component="p">© Vilna CRM</UiTypography>
      </UiContainer>
    </footer>
  );
}

function DemoMain(): React.ReactElement {
  return (
    <main>
      <UiContainer>
        <UiTypography variant="h3" component="h2">
          Dashboard
        </UiTypography>
        <UiButton type="button">Continue</UiButton>
      </UiContainer>
    </main>
  );
}

export const Default: Story = {
  args: {
    pageTitle: 'Dashboard - VilnaCRM',
    metaDescription: 'The composed toolkit layout demo.',
  },
  render: ({ pageTitle, metaDescription }): React.ReactElement => (
    <Layout
      pageTitle={pageTitle}
      metaDescription={metaDescription}
      header={<DemoHeader />}
      footer={<DemoFooter />}
    >
      <DemoMain />
    </Layout>
  ),
};

export const WithoutMetadata: Story = {
  render: (): React.ReactElement => (
    <Layout header={<DemoHeader />} footer={<DemoFooter />}>
      <DemoMain />
    </Layout>
  ),
};
